using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlexoAPP.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "condicionunica",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    farticulo = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    referencia = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    estante = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    numerocarpeta = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    createddate = table.Column<DateTime>(type: "TIMESTAMP", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    lastmodified = table.Column<DateTime>(type: "TIMESTAMP", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_condicionunica", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

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
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LastModified = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_designs", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Password = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FirstName = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LastName = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Permissions = table.Column<string>(type: "JSON", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProfileImage = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProfileImageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Action = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Timestamp = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Module = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Details = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    UserCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IpAddress = table.Column<string>(type: "varchar(45)", maxLength: 45, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Activities_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "machine_programs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineNumber = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Articulo = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtSap = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Cliente = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Referencia = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Td = table.Column<string>(type: "varchar(3)", maxLength: 3, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NumeroColores = table.Column<int>(type: "int", nullable: false),
                    Colores = table.Column<string>(type: "JSON", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Sustrato = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Kilos = table.Column<decimal>(type: "DECIMAL(10,2)", nullable: false),
                    Estado = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "LISTO")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaInicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaTintaEnMaquina = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Progreso = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Observaciones = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LastActionBy = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LastActionAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LastAction = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OperatorName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_machine_programs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_machine_programs_users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_machine_programs_users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "maquinas",
                columns: table => new
                {
                    articulo = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    numero_maquina = table.Column<int>(type: "int", nullable: false),
                    ot_sap = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    cliente = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    referencia = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    td = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    numero_colores = table.Column<int>(type: "int", nullable: false),
                    colores = table.Column<string>(type: "JSON", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    kilos = table.Column<decimal>(type: "DECIMAL(10,2)", nullable: false),
                    fecha_tinta_en_maquina = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    sustrato = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    estado = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "LISTO")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    observaciones = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    last_action_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    last_action_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    updated_by = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_maquinas", x => x.articulo);
                    table.ForeignKey(
                        name: "FK_maquinas_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_maquinas_users_updated_by",
                        column: x => x.updated_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "pedidos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineNumber = table.Column<int>(type: "int", nullable: false),
                    NumeroPedido = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Articulo = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Cliente = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Descripcion = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Cantidad = table.Column<decimal>(type: "DECIMAL(10,2)", nullable: false),
                    Unidad = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false, defaultValue: "kg")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Estado = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "PENDIENTE")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaPedido = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaEntrega = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Prioridad = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "NORMAL")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Observaciones = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AsignadoA = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pedidos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_pedidos_users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_pedidos_users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_Module",
                table: "Activities",
                column: "Module");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_Timestamp",
                table: "Activities",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_UserId",
                table: "Activities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_UserId_Timestamp",
                table: "Activities",
                columns: new[] { "UserId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_condicionunica_estante",
                table: "condicionunica",
                column: "estante");

            migrationBuilder.CreateIndex(
                name: "IX_condicionunica_farticulo",
                table: "condicionunica",
                column: "farticulo");

            migrationBuilder.CreateIndex(
                name: "IX_condicionunica_lastmodified",
                table: "condicionunica",
                column: "lastmodified");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_CreatedBy",
                table: "machine_programs",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_Estado",
                table: "machine_programs",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_FechaInicio",
                table: "machine_programs",
                column: "FechaInicio");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_MachineNumber",
                table: "machine_programs",
                column: "MachineNumber");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_MachineNumber_Estado",
                table: "machine_programs",
                columns: new[] { "MachineNumber", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_OtSap",
                table: "machine_programs",
                column: "OtSap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_UpdatedBy",
                table: "machine_programs",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_cliente",
                table: "maquinas",
                column: "cliente");

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_created_by",
                table: "maquinas",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_estado",
                table: "maquinas",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_fecha_tinta_en_maquina",
                table: "maquinas",
                column: "fecha_tinta_en_maquina");

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_numero_maquina",
                table: "maquinas",
                column: "numero_maquina");

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_numero_maquina_estado",
                table: "maquinas",
                columns: new[] { "numero_maquina", "estado" });

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_ot_sap",
                table: "maquinas",
                column: "ot_sap");

            migrationBuilder.CreateIndex(
                name: "IX_maquinas_updated_by",
                table: "maquinas",
                column: "updated_by");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_Cliente_Estado",
                table: "pedidos",
                columns: new[] { "Cliente", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_CreatedBy",
                table: "pedidos",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_Estado",
                table: "pedidos",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_FechaPedido",
                table: "pedidos",
                column: "FechaPedido");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_MachineNumber",
                table: "pedidos",
                column: "MachineNumber");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_MachineNumber_Estado",
                table: "pedidos",
                columns: new[] { "MachineNumber", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_NumeroPedido",
                table: "pedidos",
                column: "NumeroPedido",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_Prioridad",
                table: "pedidos",
                column: "Prioridad");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_UpdatedBy",
                table: "pedidos",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_users_IsActive",
                table: "users",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_users_Role",
                table: "users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_users_UserCode",
                table: "users",
                column: "UserCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Activities");

            migrationBuilder.DropTable(
                name: "condicionunica");

            migrationBuilder.DropTable(
                name: "designs");

            migrationBuilder.DropTable(
                name: "machine_programs");

            migrationBuilder.DropTable(
                name: "maquinas");

            migrationBuilder.DropTable(
                name: "pedidos");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
