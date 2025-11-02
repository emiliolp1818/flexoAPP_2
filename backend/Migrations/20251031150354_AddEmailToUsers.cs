using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlexoAPP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_machine_programs_users_UserId",
                table: "machine_programs");

            migrationBuilder.DropForeignKey(
                name: "FK_machine_programs_users_UserId1",
                table: "machine_programs");

            migrationBuilder.DropIndex(
                name: "IX_machine_programs_UserId",
                table: "machine_programs");

            migrationBuilder.DropIndex(
                name: "IX_machine_programs_UserId1",
                table: "machine_programs");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "machine_programs");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "machine_programs");

            migrationBuilder.DropColumn(
                name: "Designer",
                table: "designs");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "users",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_OtSap",
                table: "machine_programs",
                column: "OtSap",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_machine_programs_OtSap",
                table: "machine_programs");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "users");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "machine_programs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "machine_programs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Designer",
                table: "designs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_UserId",
                table: "machine_programs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_machine_programs_UserId1",
                table: "machine_programs",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_machine_programs_users_UserId",
                table: "machine_programs",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_machine_programs_users_UserId1",
                table: "machine_programs",
                column: "UserId1",
                principalTable: "users",
                principalColumn: "id");
        }
    }
}
