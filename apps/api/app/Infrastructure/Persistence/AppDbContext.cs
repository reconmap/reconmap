using api_v2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Document> Documents { get; set; }
    public DbSet<User> Users { get; set; }

    public DbSet<Contact> Contacts { get; set; }

    public DbSet<AuditEntry> AuditEntries { get; set; }
    public DbSet<Command> Commands { get; set; }
    public DbSet<CommandUsage> CommandUsages { get; set; }
    public DbSet<CommandSchedule> CommandSchedules { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<ProjectTask> Tasks { get; set; }
    public DbSet<Vulnerability> Vulnerabilities { get; set; }
    public DbSet<VulnerabilityCategory> VulnerabilityCategories { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    public DbSet<Agent> Agents { get; set; }

    public DbSet<Report> Reports { get; set; }

    public DbSet<Organisation> Organisations { get; set; }

    public DbSet<Attachment> Attachments { get; set; }

    public DbSet<Secret> Secrets { get; set; }

    public DbSet<CustomField> CustomFields { get; set; }

    public DbSet<ProjectCategory> ProjectCategories { get; set; }

    public DbSet<ProjectMember> ProjectMembers { get; set; }

    public DbSet<Asset> Assets { get; set; }

    public DbSet<Note> Notes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .Property(d => d.Role)
            .HasConversion(
                v => v.ToString().ToLower(), // C# enum → DB string
                v => Enum.Parse<UserRole>(v, ignoreCase: true)
            );
        modelBuilder.Entity<UserInfo>()
            .Property(d => d.Role)
            .HasConversion(
                v => v.ToString().ToLower(), // C# enum → DB string
                v => Enum.Parse<UserRole>(v, ignoreCase: true)
            );

        modelBuilder.Entity<Document>()
            .Property(d => d.Visibility)
            .HasConversion(
                v => v.ToString().ToLower(),
                v => Enum.Parse<DocumentVisibility>(v, ignoreCase: true)
            );
        modelBuilder.Entity<Document>()
            .Property(d => d.ParentType)
            .HasConversion(
                v => v.ToString().ToLower(), // C# enum → DB string
                v => Enum.Parse<DocumentParentType>(v, ignoreCase: true)
            );
    }

    public async Task UpdateLastLoginAsync(uint userId)
    {
        await Users
            .Where(u => u.Id == userId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.LastLoginAt, DateTime.UtcNow)
                .SetProperty(u => u.UpdatedAt, DateTime.UtcNow)
            );
    }
}
