// ===== SERVICIO DE CONVERSIÓN A PDF SIN MARCA DE AGUA =====
// Convierte documentos Office a PDF usando librerías gratuitas
// Sin marca de agua, 100% offline, open source

using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Packaging;
using OpenXmlDocument = DocumentFormat.OpenXml.Wordprocessing.Document;
using OpenXmlParagraph = DocumentFormat.OpenXml.Wordprocessing.Paragraph;

namespace FlexoAPP.API.Services
{
    public interface IPdfConversionService
    {
        Task<byte[]> ConvertExcelToPdfAsync(string filePath);
        Task<byte[]> ConvertWordToPdfAsync(string filePath);
    }

    public class PdfConversionService : IPdfConversionService
    {
        private readonly ILogger<PdfConversionService> _logger;

        public PdfConversionService(ILogger<PdfConversionService> logger)
        {
            _logger = logger;
            
            // Configurar QuestPDF para uso comunitario (gratis)
            QuestPDF.Settings.License = LicenseType.Community;
        }

        /// <summary>
        /// Convierte un archivo Excel a PDF sin marca de agua
        /// </summary>
        public async Task<byte[]> ConvertExcelToPdfAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    _logger.LogInformation($"Converting Excel to PDF: {filePath}");

                    // Abrir el archivo Excel con ClosedXML
                    using var workbook = new XLWorkbook(filePath);
                    var worksheet = workbook.Worksheet(1); // Primera hoja
                    
                    // Obtener el rango usado
                    var range = worksheet.RangeUsed();
                    if (range == null)
                    {
                        throw new Exception("El archivo Excel está vacío");
                    }

                    // Crear PDF con QuestPDF
                    var pdfBytes = QuestPDF.Fluent.Document.Create(container =>
                    {
                        container.Page(page =>
                        {
                            page.Size(PageSizes.A4.Landscape());
                            page.Margin(1, Unit.Centimetre);
                            page.PageColor(Colors.White);
                            page.DefaultTextStyle(x => x.FontSize(9));

                            page.Header()
                                .Text(worksheet.Name)
                                .SemiBold().FontSize(14).FontColor(Colors.Blue.Darken2);

                            page.Content()
                                .PaddingVertical(0.5f, Unit.Centimetre)
                                .Table(table =>
                                {
                                    // Definir columnas
                                    var columnCount = range.ColumnCount();
                                    table.ColumnsDefinition(columns =>
                                    {
                                        for (int i = 0; i < columnCount; i++)
                                        {
                                            columns.RelativeColumn();
                                        }
                                    });

                                    // Header
                                    table.Header(header =>
                                    {
                                        for (int col = 1; col <= columnCount; col++)
                                        {
                                            var cell = range.Cell(1, col);
                                            header.Cell().Element(CellStyle).Text(cell.GetString())
                                                .SemiBold().FontSize(8);
                                        }

                                        static IContainer CellStyle(IContainer container)
                                        {
                                            return container
                                                .Border(1)
                                                .BorderColor(Colors.Grey.Lighten2)
                                                .Background(Colors.Grey.Lighten3)
                                                .Padding(5);
                                        }
                                    });

                                    // Filas de datos
                                    for (int row = 2; row <= range.RowCount(); row++)
                                    {
                                        for (int col = 1; col <= columnCount; col++)
                                        {
                                            var cell = range.Cell(row, col);
                                            var value = cell.GetString();
                                            
                                            table.Cell().Element(CellStyle).Text(value);
                                        }
                                    }

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container
                                            .Border(1)
                                            .BorderColor(Colors.Grey.Lighten2)
                                            .Padding(5);
                                    }
                                });

                            page.Footer()
                                .AlignCenter()
                                .Text(x =>
                                {
                                    x.Span("Página ");
                                    x.CurrentPageNumber();
                                    x.Span(" de ");
                                    x.TotalPages();
                                });
                        });
                    }).GeneratePdf();

                    _logger.LogInformation($"Excel converted successfully: {pdfBytes.Length} bytes");
                    return pdfBytes;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error converting Excel to PDF: {filePath}");
                    throw;
                }
            });
        }

        /// <summary>
        /// Convierte un archivo Word a PDF sin marca de agua
        /// </summary>
        public async Task<byte[]> ConvertWordToPdfAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    _logger.LogInformation($"Converting Word to PDF: {filePath}");

                    // Leer el contenido del documento Word
                    var paragraphs = new List<string>();
                    
                    using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(filePath, false))
                    {
                        var body = wordDoc.MainDocumentPart?.Document?.Body;
                        if (body != null)
                        {
                            foreach (var paragraph in body.Elements<OpenXmlParagraph>())
                            {
                                var text = paragraph.InnerText;
                                if (!string.IsNullOrWhiteSpace(text))
                                {
                                    paragraphs.Add(text);
                                }
                            }
                        }
                    }

                    // Crear PDF con QuestPDF
                    var pdfBytes = QuestPDF.Fluent.Document.Create(container =>
                    {
                        container.Page(page =>
                        {
                            page.Size(PageSizes.A4);
                            page.Margin(2, Unit.Centimetre);
                            page.PageColor(Colors.White);
                            page.DefaultTextStyle(x => x.FontSize(11).LineHeight(1.5f));

                            page.Header()
                                .Text(Path.GetFileNameWithoutExtension(filePath))
                                .SemiBold().FontSize(16).FontColor(Colors.Blue.Darken2);

                            page.Content()
                                .PaddingVertical(1, Unit.Centimetre)
                                .Column(column =>
                                {
                                    foreach (var para in paragraphs)
                                    {
                                        column.Item().Text(para).FontSize(11);
                                        column.Item().PaddingBottom(0.5f, Unit.Centimetre);
                                    }
                                });

                            page.Footer()
                                .AlignCenter()
                                .Text(x =>
                                {
                                    x.Span("Página ");
                                    x.CurrentPageNumber();
                                    x.Span(" de ");
                                    x.TotalPages();
                                });
                        });
                    }).GeneratePdf();

                    _logger.LogInformation($"Word converted successfully: {pdfBytes.Length} bytes");
                    return pdfBytes;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error converting Word to PDF: {filePath}");
                    throw;
                }
            });
        }
    }
}
