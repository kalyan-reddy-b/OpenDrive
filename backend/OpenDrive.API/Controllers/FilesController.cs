using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenDrive.Application.Common.Requests;
using OpenDrive.Application.DTOs.File;
using OpenDrive.Application.Interfaces;

namespace OpenDrive.API.Controllers;

[Authorize]
public class FilesController : BaseController
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFiles(
        [FromQuery] PagedRequest request,
        [FromQuery] Guid? folderId = null,
        [FromQuery] string? category = null,
        [FromQuery] bool? isFavorite = null,
        [FromQuery] bool isTrash = false)
    {
        var response = await _fileService.GetFilesAsync(
            UserId, request, folderId, category, isFavorite, isTrash);
        return Ok(response);
    }

    [HttpPost("upload")]
    [RequestSizeLimit(104_857_600)] // 100 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 104_857_600)]
    public async Task<IActionResult> UploadFile([FromForm] UploadFileFormRequest request)
    {
        if (request.File == null || request.File.Length == 0)
        {
            return BadRequest(new { success = false, message = "No file provided or file is empty." });
        }

        var response = await _fileService.UploadFileAsync(UserId, request.File, request.FolderId);
        
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFile(Guid id, [FromQuery] bool hardDelete = false)
    {
        var response = await _fileService.DeleteFileAsync(UserId, id, hardDelete);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestoreFile(Guid id)
    {
        var response = await _fileService.RestoreFileAsync(UserId, id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("{id}/favorite")]
    public async Task<IActionResult> ToggleFavorite(Guid id)
    {
        var response = await _fileService.ToggleFavoriteAsync(UserId, id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
        var result = await _fileService.GetFileForDownloadAsync(UserId, id);
        if (result == null)
            return NotFound(new { success = false, message = "File not found." });

        var (filePath, contentType, fileName) = result.Value;
        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(bytes, contentType, fileName);
    }
}
