using OpenDrive.Application.Common.Requests;
using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.DTOs.Folder;

namespace OpenDrive.Application.Interfaces;

public interface IFolderService
{
    Task<PagedResponse<FolderDto>> GetFoldersAsync(Guid userId, PagedRequest request, Guid? parentFolderId = null);
    Task<ApiResponse<FolderDto>> CreateFolderAsync(Guid userId, CreateFolderRequest request);
    Task<ApiResponse<bool>> DeleteFolderAsync(Guid userId, Guid folderId);
}
