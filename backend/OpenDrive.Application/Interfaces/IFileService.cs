using Microsoft.AspNetCore.Http;
using OpenDrive.Application.Common.Requests;
using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.DTOs.File;

namespace OpenDrive.Application.Interfaces;

public interface IFileService
{
    Task<PagedResponse<FileDto>> GetFilesAsync(Guid userId, PagedRequest request, Guid? folderId = null, string? category = null, bool? isFavorite = null, bool isTrash = false);
    Task<ApiResponse<FileDto>> UploadFileAsync(Guid userId, IFormFile file, Guid? folderId = null);
    Task<ApiResponse<bool>> DeleteFileAsync(Guid userId, Guid fileId, bool hardDelete = false);
    Task<ApiResponse<FileDto>> RestoreFileAsync(Guid userId, Guid fileId);
    Task<ApiResponse<FileDto>> ToggleFavoriteAsync(Guid userId, Guid fileId);
    Task<(string FilePath, string ContentType, string FileName)?> GetFileForDownloadAsync(Guid userId, Guid fileId);
}
