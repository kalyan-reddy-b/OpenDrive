namespace OpenDrive.Application.DTOs.Folder;

public class CreateFolderRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentFolderId { get; set; }
}
