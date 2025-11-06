using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    public class DesignDto
    {
        public int Id { get; set; }
        public string ArticleF { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Substrate { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string PrintType { get; set; } = string.Empty;
        public int ColorCount { get; set; }
        public List<string> Colors { get; set; } = new List<string>();
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }
        public DateTime LastModified { get; set; }
        public int CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
    }

    public class CreateDesignDto
    {
        [Required(ErrorMessage = "El artículo F es requerido")]
        [StringLength(50, ErrorMessage = "El artículo F no puede exceder 50 caracteres")]
        public string ArticleF { get; set; } = string.Empty;

        [Required(ErrorMessage = "El cliente es requerido")]
        [StringLength(200, ErrorMessage = "El cliente no puede exceder 200 caracteres")]
        public string Client { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es requerida")]
        [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "El sustrato es requerido")]
        [StringLength(100, ErrorMessage = "El sustrato no puede exceder 100 caracteres")]
        public string Substrate { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo es requerido")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de impresión es requerido")]
        public string PrintType { get; set; } = string.Empty;

        [Required(ErrorMessage = "El número de colores es requerido")]
        [Range(1, 10, ErrorMessage = "El número de colores debe estar entre 1 y 10")]
        public int ColorCount { get; set; }

        [Required(ErrorMessage = "Los colores son requeridos")]
        public List<string> Colors { get; set; } = new List<string>();

        public string Status { get; set; } = "ACTIVO";
    }

    public class UpdateDesignDto
    {
        [StringLength(50, ErrorMessage = "El artículo F no puede exceder 50 caracteres")]
        public string? ArticleF { get; set; }

        [StringLength(200, ErrorMessage = "El cliente no puede exceder 200 caracteres")]
        public string? Client { get; set; }

        [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Description { get; set; }

        [StringLength(100, ErrorMessage = "El sustrato no puede exceder 100 caracteres")]
        public string? Substrate { get; set; }

        public string? Type { get; set; }

        public string? PrintType { get; set; }

        [Range(1, 10, ErrorMessage = "El número de colores debe estar entre 1 y 10")]
        public int? ColorCount { get; set; }

        public List<string>? Colors { get; set; }

        public string? Status { get; set; }


    }

    public class DesignStatsDto
    {
        public int TotalDesigns { get; set; }
        public int ActiveDesigns { get; set; }
        public int InactiveDesigns { get; set; }
        public int LaminaDesigns { get; set; }
        public int TubularDesigns { get; set; }
        public int SemitubularDesigns { get; set; }
        public double AverageColors { get; set; }
    }

    public class DesignSearchDto
    {
        public string? SearchTerm { get; set; }
        public string? Status { get; set; }
        public string? Type { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "LastModified";
        public string SortDirection { get; set; } = "desc";
    }

    public class BulkCreateDesignDto
    {
        public List<CreateDesignDto> Designs { get; set; } = new();
    }

    public class DesignStatusUpdateDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class DesignListResponseDto
    {
        public IEnumerable<DesignDto> Designs { get; set; } = new List<DesignDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class DesignFiltersDto
    {
        public IEnumerable<string> Clients { get; set; } = new List<string>();

        public IEnumerable<string> Substrates { get; set; } = new List<string>();
        public IEnumerable<string> Types { get; set; } = new List<string> { "LAMINA", "TUBULAR", "SEMITUBULAR" };
        public IEnumerable<string> PrintTypes { get; set; } = new List<string> { "CARA", "DORSO", "CARA_DORSO" };
        public IEnumerable<string> Statuses { get; set; } = new List<string> { "ACTIVO", "INACTIVO" };
    }

    public class ImportResultDto
    {
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public TimeSpan ProcessingTime { get; set; }
        public string FileName { get; set; } = string.Empty;
    }

    // ===== OPTIMIZED DTOs FOR FAST LOADING =====

    /// <summary>
    /// Paginated designs response (OPTIMIZED)
    /// </summary>
    public class PaginatedDesignsDto
    {
        public IEnumerable<DesignDto> Items { get; set; } = new List<DesignDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
        public TimeSpan LoadTime { get; set; }
    }

    /// <summary>
    /// Design summary DTO (ULTRA FAST - Only essential fields)
    /// </summary>
    public class DesignSummaryDto
    {
        public int Id { get; set; }
        public string ArticleF { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ColorCount { get; set; }
        public DateTime LastModified { get; set; }
    }

    /// <summary>
    /// Design lazy loading DTO (Load details on demand)
    /// </summary>
    public class DesignLazyDto
    {
        public int Id { get; set; }
        public string ArticleF { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ColorCount { get; set; }
        public DateTime LastModified { get; set; }
        
        // Colors loaded on demand
        public bool ColorsLoaded { get; set; } = false;
        public List<string>? Colors { get; set; }
        
        // Additional details loaded on demand
        public bool DetailsLoaded { get; set; } = false;
        public string? Substrate { get; set; }
        public string? Type { get; set; }
        public string? PrintType { get; set; }
    }

    /// <summary>
    /// Bulk operations response DTO
    /// </summary>
    public class BulkOperationResultDto
    {
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public int TotalProcessed { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public TimeSpan ProcessingTime { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Design cache info DTO
    /// </summary>
    public class DesignCacheInfoDto
    {
        public int CachedCount { get; set; }
        public DateTime LastCacheUpdate { get; set; }
        public TimeSpan CacheAge { get; set; }
        public bool IsCacheValid { get; set; }
        public string CacheStatus { get; set; } = string.Empty;
    }
}