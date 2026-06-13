using Microsoft.AspNetCore.Http;

namespace OpenDrive.Application.DTOs.File;

public class UploadFileFormRequest
{
    public IFormFile File { get; set; } = default!;
    public Guid? FolderId { get; set; }
}