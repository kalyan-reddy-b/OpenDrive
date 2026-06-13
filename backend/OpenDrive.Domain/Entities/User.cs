using OpenDrive.Domain.Common;

namespace OpenDrive.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Folder> Folders { get; set; } = new List<Folder>();
    public ICollection<File> Files { get; set; } = new List<File>();
    public ICollection<FileShare> SharedFiles { get; set; } = new List<FileShare>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}
