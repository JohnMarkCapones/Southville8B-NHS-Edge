using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SouthvilleEPortal.API.Modules.Students.Domain.Entities;

namespace SouthvilleEPortal.API.Modules.Students.Infrastructure.EFConfigs;

public class StudentConfig : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("students");
        builder.HasKey(s => s.Id);
        builder.OwnsOne(s => s.Name, nb =>
        {
            nb.Property(p => p.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
            nb.Property(p => p.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
        });
        builder.Property(s => s.Email).HasMaxLength(320).IsRequired();
        builder.Property(s => s.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();
        builder.HasIndex(s => s.Email).IsUnique();
    }
}
