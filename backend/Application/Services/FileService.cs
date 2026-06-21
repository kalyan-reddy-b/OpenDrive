using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OpenDrive.Application.Common.Requests;
using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.DTOs.File;
using OpenDrive.Application.Interfaces;
using OpenDrive.Domain.Entities;
using File = OpenDrive.Domain.Entities.File;
using DbFileShare = OpenDrive.Domain.Entities.FileShare;

namespace OpenDrive.Application.Services;

public class FileService : IFileService
{
    private readonly IRepository<File> _fileRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<DbFileShare> _fileShareRepository;
    private readonly IRepository<Notification> _notificationRepository;

    public FileService(
        IRepository<File> fileRepository,
        IRepository<User> userRepository,
        IRepository<DbFileShare> fileShareRepository,
        IRepository<Notification> notificationRepository)
    {
        _fileRepository = fileRepository;
        _userRepository = userRepository;
        _fileShareRepository = fileShareRepository;
        _notificationRepository = notificationRepository;
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

        await using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, System.IO.FileShare.None, 81920, true))
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

    // ─── File Sharing ────────────────────────────────────────────────────────
    public async Task<ApiResponse<bool>> ShareFileAsync(Guid ownerId, Guid fileId, string targetEmailOrUsername)
    {
        // 1. Verify file exists and belongs to owner
        var file = await _fileRepository.Query().FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == ownerId);
        if (file == null) return ApiResponse<bool>.ErrorResponse("File not found or access denied.");

        // 2. Find target user
        var query = targetEmailOrUsername.Trim().ToLower();
        var targetUser = await _userRepository.Query()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == query || u.Username.ToLower() == query);
        if (targetUser == null) return ApiResponse<bool>.ErrorResponse("User not found.");

        if (targetUser.Id == ownerId) return ApiResponse<bool>.ErrorResponse("You cannot share a file with yourself.");

        // 3. Check if already shared
        var existingShare = await _fileShareRepository.Query()
            .FirstOrDefaultAsync(s => s.FileId == fileId && s.SharedWithUserId == targetUser.Id);

        if (existingShare != null) return ApiResponse<bool>.SuccessResponse(true, "File is already shared with this user.");

        // 4. Create share mapping
        var share = new DbFileShare
        {
            FileId = fileId,
            SharedWithUserId = targetUser.Id,
            Permission = "Read"
        };
        await _fileShareRepository.AddAsync(share);
        await _fileShareRepository.SaveChangesAsync();

        // 5. Send notification to target user
        var owner = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == ownerId);
        var ownerName = owner?.Username ?? "Someone";
        var notification = new Notification
        {
            UserId = targetUser.Id,
            Title = "New File Shared",
            Message = $"{ownerName} shared the file '{file.Name}' with you.",
            IsRead = false
        };
        await _notificationRepository.AddAsync(notification);
        await _notificationRepository.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "File shared successfully.");
    }

    public async Task<PagedResponse<FileDto>> GetSharedWithMeFilesAsync(Guid userId, PagedRequest request)
    {
        // Query the files through the FileShares where user matches
        var query = _fileShareRepository.Query()
            .Include(fs => fs.File)
            .Where(fs => fs.SharedWithUserId == userId)
            .Select(fs => fs.File);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(f => f.Name.Contains(request.SearchTerm));
        }

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

    public async Task<ApiResponse<bool>> RemoveShareAsync(Guid ownerId, Guid fileId, Guid sharedWithUserId)
    {
        // Verify ownership
        var file = await _fileRepository.Query().FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == ownerId);
        if (file == null) return ApiResponse<bool>.ErrorResponse("File not found or access denied.");

        var share = await _fileShareRepository.Query()
            .FirstOrDefaultAsync(s => s.FileId == fileId && s.SharedWithUserId == sharedWithUserId);

        if (share == null) return ApiResponse<bool>.ErrorResponse("Share relation not found.");

        await _fileShareRepository.DeleteAsync(share);
        await _fileShareRepository.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Share removed successfully.");
    }
}
