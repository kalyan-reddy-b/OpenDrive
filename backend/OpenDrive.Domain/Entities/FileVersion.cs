using OpenDrive.Domain.Common;

namespace OpenDrive.Domain.Entities;

public class FileVersion : BaseEntity
{
    public int VersionNumber { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public long Size { get; set; }
    public string ContentHash { get; set; } = string.Empty;

    public Guid FileId { get; set; }
    public File File { get; set; } = null!;
}
