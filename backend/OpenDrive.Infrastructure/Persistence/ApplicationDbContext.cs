using Microsoft.EntityFrameworkCore;
using OpenDrive.Domain.Entities;
using File = OpenDrive.Domain.Entities.File;
using FileShare = OpenDrive.Domain.Entities.FileShare;
namespace OpenDrive.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Folder> Folders => Set<Folder>();
    public DbSet<File> Files => Set<File>();
    public DbSet<FileVersion> FileVersions => Set<FileVersion>();
    public DbSet<FileShare> FileShares => Set<FileShare>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(b =>
        {
            b.HasQueryFilter(u => !u.IsDeleted);
            b.HasIndex(u => u.Email).IsUnique();
            b.HasIndex(u => u.Username).IsUnique();
        });

        builder.Entity<Role>(b =>
        {
            b.HasQueryFilter(r => !r.IsDeleted);
            b.HasIndex(r => r.Name).IsUnique();
        });

        builder.Entity<Folder>(b =>
        {
            b.HasQueryFilter(f => !f.IsDeleted);
            b.HasOne(f => f.ParentFolder)
                .WithMany(f => f.SubFolders)
                .HasForeignKey(f => f.ParentFolderId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(f => f.User)
                .WithMany(u => u.Folders)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<File>(b =>
        {
            b.HasQueryFilter(f => !f.IsDeleted);
            b.HasOne(f => f.Folder)
                .WithMany(folder => folder.Files)
                .HasForeignKey(f => f.FolderId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(f => f.User)
                .WithMany(u => u.Files)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<FileVersion>(b =>
        {
            b.HasQueryFilter(fv => !fv.IsDeleted);
        });

        builder.Entity<FileShare>(b =>
        {
            b.HasQueryFilter(fs => !fs.IsDeleted);
            b.HasOne(fs => fs.File)
                .WithMany(f => f.Shares)
                .HasForeignKey(fs => fs.FileId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(fs => fs.SharedWithUser)
                .WithMany(u => u.SharedFiles)
                .HasForeignKey(fs => fs.SharedWithUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<RefreshToken>(b =>
        {
            b.HasQueryFilter(rt => !rt.IsDeleted);
        });

        builder.Entity<Notification>(b =>
        {
            b.HasQueryFilter(n => !n.IsDeleted);
        });

        builder.Entity<ActivityLog>(b =>
        {
            b.HasQueryFilter(al => !al.IsDeleted);
        });
    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries<OpenDrive.Domain.Common.BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
