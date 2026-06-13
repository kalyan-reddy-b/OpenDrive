using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OpenDrive.Application.Common.Requests;
using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.DTOs.File;
using OpenDrive.Application.Interfaces;
using File = OpenDrive.Domain.Entities.File;

namespace OpenDrive.Application.Services;

public class FileService : IFileService
{
    private readonly IRepository<File> _fileRepository;

    public FileService(IRepository<File> fileRepository)
    {
        _fileRepository = fileRepository;
    }

    // ─── Query ───────────────────────────────────────────────────────────────
    public async Task<PagedResponse<FileDto>> GetFilesAsync(
        Guid userId, PagedRequest request,
        Guid? folderId = null, string? category = null,
        bool? isFavorite = null, bool isTrash = false)
    {
        var query = _fileRepository.Query()
            .IgnoreQueryFilters()
            .Where(f => f.UserId == userId && f.IsDeleted == isTrash);

        // Root folder filter only when no special filter is active
        if (!isTrash && isFavorite == null && string.IsNullOrEmpty(category))
            query = query.Where(f => f.FolderId == folderId);

        if (isFavorite == true)
            query = query.Where(f => f.IsFavorite);

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = category.ToLower() switch
            {
                "documents" => query.Where(f =>
                    f.ContentType.Contains("pdf") ||
                    f.ContentType.Contains("word") ||
                    f.ContentType.Contains("text") ||
                    f.ContentType.Contains("spreadsheet") ||
                    f.ContentType.Contains("presentation")),
                "images" => query.Where(f => f.ContentType.Contains("image")),
                "videos" => query.Where(f => f.ContentType.Contains("video")),
                "others" => query.Where(f =>
                    !f.ContentType.Contains("pdf") &&
                    !f.ContentType.Contains("word") &&
                    !f.ContentType.Contains("text") &&
                    !f.ContentType.Contains("spreadsheet") &&
                    !f.ContentType.Contains("presentation") &&
                    !f.ContentType.Contains("image") &&
                    !f.ContentType.Contains("video")),
                _ => query
            };
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            query = query.Where(f => f.Name.Contains(request.SearchTerm));

        query = !string.IsNullOrWhiteSpace(request.SortBy)
            ? request.SortBy.ToLower() switch
            {
                "name" => request.SortDescending ? query.OrderByDescending(f => f.Name) : query.OrderBy(f => f.Name),
                "size" => request.SortDescending ? query.OrderByDescending(f => f.Size) : query.OrderBy(f => f.Size),
                _ => query.OrderByDescending(f => f.CreatedAt)
            }
            : query.OrderByDescending(f => f.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FileDto
            {
                Id = f.Id,
                Name = f.Name,
                ContentType = f.ContentType,
                Size = f.Size,
                FolderId = f.FolderId,
                CreatedAt = f.CreatedAt,
                IsFavorite = f.IsFavorite,
                IsDeleted = f.IsDeleted
            })
            .ToListAsync();

        return PagedResponse<FileDto>.SuccessPagedResponse(items, request.PageNumber, request.PageSize, total);
    }

    // ─── Upload ──────────────────────────────────────────────────────────────
    public async Task<ApiResponse<FileDto>> UploadFileAsync(Guid userId, IFormFile fileForm, Guid? folderId = null)
    {
        if (fileForm == null || fileForm.Length == 0)
            return ApiResponse<FileDto>.ErrorResponse("File is empty.");

        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", userId.ToString());
        Directory.CreateDirectory(uploadsPath); // no-op if exists

        // Deduplicate filename
        var original = Path.GetFileName(fileForm.FileName);
        var ext = Path.GetExtension(original);
        var stem = Path.GetFileNameWithoutExtension(original);
        var fileName = original;
        var filePath = Path.Combine(uploadsPath, fileName);
        if (System.IO.File.Exists(filePath))
        {
            fileName = $"{stem}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{ext}";
            filePath = Path.Combine(uploadsPath, fileName);
        }

        await using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 81920, true))
        {
            await fileForm.CopyToAsync(stream);
        }

        var file = new File
        {
            Name = fileName,
            ContentType = fileForm.ContentType,
            Size = fileForm.Length,
            FolderId = folderId,
            UserId = userId,
            IsFavorite = false
        };

        await _fileRepository.AddAsync(file);
        await _fileRepository.SaveChangesAsync();

        return ApiResponse<FileDto>.SuccessResponse(MapToDto(file), "File uploaded successfully.");
    }

    // ─── Delete ──────────────────────────────────────────────────────────────
    public async Task<ApiResponse<bool>> DeleteFileAsync(Guid userId, Guid fileId, bool hardDelete = false)
    {
        var file = await _fileRepository.Query()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == userId);

        if (file == null) return ApiResponse<bool>.ErrorResponse("File not found.");

        if (hardDelete)
        {
            var physicalPath = PhysicalPath(userId, file.Name);
            if (System.IO.File.Exists(physicalPath)) System.IO.File.Delete(physicalPath);
            await _fileRepository.DeleteAsync(file);
        }
        else
        {
            file.IsDeleted = true;
            file.UpdatedAt = DateTime.UtcNow;
            await _fileRepository.UpdateAsync(file);
        }

        await _fileRepository.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "File deleted successfully.");
    }

    // ─── Restore ─────────────────────────────────────────────────────────────
    public async Task<ApiResponse<FileDto>> RestoreFileAsync(Guid userId, Guid fileId)
    {
        var file = await _fileRepository.Query()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == userId);

        if (file == null) return ApiResponse<FileDto>.ErrorResponse("File not found.");

        file.IsDeleted = false;
        file.UpdatedAt = DateTime.UtcNow;
        await _fileRepository.UpdateAsync(file);
        await _fileRepository.SaveChangesAsync();

        return ApiResponse<FileDto>.SuccessResponse(MapToDto(file), "File restored.");
    }

    // ─── Favorite ────────────────────────────────────────────────────────────
    public async Task<ApiResponse<FileDto>> ToggleFavoriteAsync(Guid userId, Guid fileId)
    {
        var file = await _fileRepository.Query()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == userId);

        if (file == null) return ApiResponse<FileDto>.ErrorResponse("File not found.");

        file.IsFavorite = !file.IsFavorite;
        file.UpdatedAt = DateTime.UtcNow;
        await _fileRepository.UpdateAsync(file);
        await _fileRepository.SaveChangesAsync();

        return ApiResponse<FileDto>.SuccessResponse(
            MapToDto(file),
            file.IsFavorite ? "Added to favorites." : "Removed from favorites.");
    }

    // ─── Download ────────────────────────────────────────────────────────────
    public async Task<(string FilePath, string ContentType, string FileName)?> GetFileForDownloadAsync(Guid userId, Guid fileId)
    {
        var file = await _fileRepository.Query()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == userId);

        if (file == null) return null;

        var physicalPath = PhysicalPath(userId, file.Name);
        return System.IO.File.Exists(physicalPath) ? (physicalPath, file.ContentType, file.Name) : null;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private static FileDto MapToDto(File f) => new()
    {
        Id = f.Id,
        Name = f.Name,
        ContentType = f.ContentType,
        Size = f.Size,
        FolderId = f.FolderId,
        CreatedAt = f.CreatedAt,
        IsFavorite = f.IsFavorite,
        IsDeleted = f.IsDeleted
    };

    private static string PhysicalPath(Guid userId, string fileName) =>
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", userId.ToString(), fileName);
}
