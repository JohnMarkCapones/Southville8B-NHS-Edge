using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSaltPepperToRefreshTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_auth_refresh_tokens_TokenHash",
                table: "auth_refresh_tokens");

            migrationBuilder.AddColumn<string>(
                name: "LookupHash",
                table: "auth_refresh_tokens",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Salt",
                table: "auth_refresh_tokens",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_auth_refresh_tokens_LookupHash",
                table: "auth_refresh_tokens",
                column: "LookupHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_auth_refresh_tokens_LookupHash",
                table: "auth_refresh_tokens");

            migrationBuilder.DropColumn(
                name: "LookupHash",
                table: "auth_refresh_tokens");

            migrationBuilder.DropColumn(
                name: "Salt",
                table: "auth_refresh_tokens");

            migrationBuilder.CreateIndex(
                name: "IX_auth_refresh_tokens_TokenHash",
                table: "auth_refresh_tokens",
                column: "TokenHash",
                unique: true);
        }
    }
}
