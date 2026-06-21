using Microsoft.EntityFrameworkCore;
using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.Interfaces;
using OpenDrive.Domain.Entities;

namespace OpenDrive.Application.Services;

public interface INotificationService
{
    Task<ApiResponse<IEnumerable<Notification>>> GetUnreadNotificationsAsync(Guid userId);
    Task<ApiResponse<bool>> MarkAsReadAsync(Guid userId, Guid notificationId);
    Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId);
}

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _repository;

    public NotificationService(IRepository<Notification> repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<IEnumerable<Notification>>> GetUnreadNotificationsAsync(Guid userId)
    {
        var notifications = await _repository.Query()
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return ApiResponse<IEnumerable<Notification>>.SuccessResponse(notifications);
    }

    public async Task<ApiResponse<bool>> MarkAsReadAsync(Guid userId, Guid notificationId)
    {
        var notification = await _repository.Query().FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        if (notification == null) return ApiResponse<bool>.ErrorResponse("Notification not found");

        notification.IsRead = true;
        await _repository.UpdateAsync(notification);
        await _repository.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true);
    }

    public async Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _repository.Query().Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        foreach (var n in notifications)
        {
            n.IsRead = true;
            await _repository.UpdateAsync(n);
        }
        await _repository.SaveChangesAsync();
        
        return ApiResponse<bool>.SuccessResponse(true);
    }
}
