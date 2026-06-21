using OpenDrive.Domain.Common;

namespace OpenDrive.Domain.Entities;

public class FileShare : BaseEntity
{
    public Guid FileId { get; set; }
    public File File { get; set; } = null!;

    public Guid SharedWithUserId { get; set; }
    public User SharedWithUser { get; set; } = null!;

    public string Permission { get; set; } = "Read";
    public DateTime? ExpiresAt { get; set; }
}
