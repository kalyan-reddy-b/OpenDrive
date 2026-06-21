using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenDrive.Application.Services;

namespace OpenDrive.API.Controllers;

[Authorize]
public class NotificationsController : BaseController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUnread()
    {
        var response = await _notificationService.GetUnreadNotificationsAsync(UserId);
        return Ok(response);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var response = await _notificationService.MarkAsReadAsync(UserId, id);
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var response = await _notificationService.MarkAllAsReadAsync(UserId);
        return Ok(response);
    }
}
