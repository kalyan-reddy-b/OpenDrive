using OpenDrive.Domain.Common;

namespace OpenDrive.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public bool IsExpired => DateTime.UtcNow >= Expires;
    public bool IsRevoked { get; set; }
    public bool IsActive => !IsRevoked && !IsExpired;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
