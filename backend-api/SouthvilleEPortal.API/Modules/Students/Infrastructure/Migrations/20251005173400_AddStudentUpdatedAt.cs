using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouthvilleEPortal.API.Modules.Students.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentUpdatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "students",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "students");
        }
    }
}
