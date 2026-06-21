using OpenDrive.Domain.Common;

namespace OpenDrive.Domain.Entities;

public class File : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    
    public Guid? FolderId { get; set; }
    public Folder? Folder { get; set; }
    
    public bool IsFavorite { get; set; } = false;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<FileVersion> Versions { get; set; } = new List<FileVersion>();
    public ICollection<FileShare> Shares { get; set; } = new List<FileShare>();
}
