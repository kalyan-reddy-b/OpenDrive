namespace OpenDrive.Application.DTOs.File;

public class UploadFileRequest
{
    public string Name { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public Guid? FolderId { get; set; }
}
