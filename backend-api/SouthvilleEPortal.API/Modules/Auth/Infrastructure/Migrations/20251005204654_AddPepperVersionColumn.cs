using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPepperVersionColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PepperVersion",
                table: "auth_refresh_tokens",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                defaultValue: "V2");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PepperVersion",
                table: "auth_refresh_tokens");
        }
    }
}
