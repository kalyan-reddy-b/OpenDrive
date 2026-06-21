using OpenDrive.Domain.Common;

namespace OpenDrive.Domain.Entities;

public class Folder : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    public Guid? ParentFolderId { get; set; }
    public Folder? ParentFolder { get; set; }
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<Folder> SubFolders { get; set; } = new List<Folder>();
    public ICollection<File> Files { get; set; } = new List<File>();
}
