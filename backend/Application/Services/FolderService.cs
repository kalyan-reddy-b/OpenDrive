using Microsoft.EntityFrameworkCore;
using OpenDrive.Application.Common.Requests;
using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.DTOs.Folder;
using OpenDrive.Application.Interfaces;
using OpenDrive.Domain.Entities;

namespace OpenDrive.Application.Services;

public class FolderService : IFolderService
{
    private readonly IRepository<Folder> _folderRepository;

    public FolderService(IRepository<Folder> folderRepository)
    {
        _folderRepository = folderRepository;
    }

    public async Task<PagedResponse<FolderDto>> GetFoldersAsync(Guid userId, PagedRequest request, Guid? parentFolderId = null)
    {
        var query = _folderRepository.Query().Where(f => f.UserId == userId && f.ParentFolderId == parentFolderId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(f => f.Name.Contains(request.SearchTerm));
        }

        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            query = request.SortBy.ToLower() switch
            {
                "name" => request.SortDescending ? query.OrderByDescending(f => f.Name) : query.OrderBy(f => f.Name),
                "createdat" => request.SortDescending ? query.OrderByDescending(f => f.CreatedAt) : query.OrderBy(f => f.CreatedAt),
                _ => query.OrderByDescending(f => f.CreatedAt)
            };
        }
        else
        {
            query = query.OrderByDescending(f => f.CreatedAt);
        }

        var totalRecords = await query.CountAsync();
        var folders = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FolderDto
            {
                Id = f.Id,
                Name = f.Name,
                ParentFolderId = f.ParentFolderId,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync();

        return PagedResponse<FolderDto>.SuccessPagedResponse(folders, request.PageNumber, request.PageSize, totalRecords);
    }

    public async Task<ApiResponse<FolderDto>> CreateFolderAsync(Guid userId, CreateFolderRequest request)
    {
        var folder = new Folder
        {
            Name = request.Name,
            ParentFolderId = request.ParentFolderId,
            UserId = userId
        };

        await _folderRepository.AddAsync(folder);
        await _folderRepository.SaveChangesAsync();

        return ApiResponse<FolderDto>.SuccessResponse(new FolderDto
        {
            Id = folder.Id,
            Name = folder.Name,
            ParentFolderId = folder.ParentFolderId,
            CreatedAt = folder.CreatedAt
        });
    }

    public async Task<ApiResponse<bool>> DeleteFolderAsync(Guid userId, Guid folderId)
    {
        var folder = await _folderRepository.Query().FirstOrDefaultAsync(f => f.Id == folderId && f.UserId == userId);
        if (folder == null)
            return ApiResponse<bool>.ErrorResponse("Folder not found or access denied.");

        await _folderRepository.DeleteAsync(folder);
        await _folderRepository.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Folder deleted successfully.");
    }
}
