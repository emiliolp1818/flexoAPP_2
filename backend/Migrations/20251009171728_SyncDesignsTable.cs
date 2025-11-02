using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlexoAPP.API.Migrations
{
    /// <inheritdoc />
    public partial class SyncDesignsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "designs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ArticleF = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Client = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Substrate = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrintType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ColorCount = table.Column<int>(type: "int", nullable: true),
                    color1 = table.Column<string>(name: "color 1", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color2 = table.Column<string>(name: "color 2", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color3 = table.Column<string>(name: "color 3", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color4 = table.Column<string>(name: "color 4", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color5 = table.Column<string>(name: "color 5", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color6 = table.Column<string>(name: "color 6", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color7 = table.Column<string>(name: "color 7", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color8 = table.Column<string>(name: "color 8", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color9 = table.Column<string>(name: "color 9", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    color10 = table.Column<string>(name: "color 10", type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Designer = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LastModified = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_designs", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "designs");
        }
    }
}
