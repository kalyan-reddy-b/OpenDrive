using OpenDrive.Domain.Common;

namespace OpenDrive.Domain.Entities;

public class Notification : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
