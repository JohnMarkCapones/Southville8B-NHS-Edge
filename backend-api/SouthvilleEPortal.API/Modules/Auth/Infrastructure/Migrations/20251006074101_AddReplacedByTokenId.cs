using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReplacedByTokenId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReplacedByTokenId",
                table: "auth_refresh_tokens",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_auth_refresh_tokens_ReplacedByTokenId",
                table: "auth_refresh_tokens",
                column: "ReplacedByTokenId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_auth_refresh_tokens_ReplacedByTokenId",
                table: "auth_refresh_tokens");

            migrationBuilder.DropColumn(
                name: "ReplacedByTokenId",
                table: "auth_refresh_tokens");
        }
    }
}
