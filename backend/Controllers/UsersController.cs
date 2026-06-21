using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenDrive.Application.Interfaces;
using OpenDrive.Domain.Entities;

namespace OpenDrive.API.Controllers;

[Authorize]
public class UsersController : BaseController
{
    private readonly IRepository<User> _userRepository;

    public UsersController(IRepository<User> userRepository)
    {
        _userRepository = userRepository;
    }

    // ─── Update Profile ───────────────────────────────────────────────────────
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        {
            return BadRequest(new { success = false, message = "First Name and Last Name are required." });
        }

        var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == UserId);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found." });
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Phone = request.Phone?.Trim() ?? string.Empty;
        user.Bio = request.Bio?.Trim() ?? string.Empty;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Profile updated successfully.",
            data = new
            {
                userId = user.Id,
                username = user.Username,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                phone = user.Phone,
                bio = user.Bio,
                avatar = user.Avatar
            }
        });
    }

    // ─── Change Password ─────────────────────────────────────────────────────
    [HttpPost("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { success = false, message = "All password fields are required." });
        }

        var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == UserId);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found." });
        }

        // Verify existing password
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { success = false, message = "Incorrect current password." });
        }

        // Update with new password hash
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { success = true, message = "Password updated successfully." });
    }

    // ─── Search Users (For File Sharing) ──────────────────────────────────────
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
        {
            return Ok(new { success = true, data = Array.Empty<object>() });
        }

        var lowerQuery = query.ToLower();

        // Find users matching username or email (excluding the calling user)
        var users = await _userRepository.Query()
            .Where(u => u.Id != UserId && 
                       (u.Username.ToLower().Contains(lowerQuery) || 
                        u.Email.ToLower().Contains(lowerQuery)))
            .Select(u => new
            {
                userId = u.Id,
                username = u.Username,
                email = u.Email,
                firstName = u.FirstName,
                lastName = u.LastName
            })
            .Take(10)
            .ToListAsync();

        return Ok(new { success = true, data = users });
    }
}

// ─── Request DTOs ────────────────────────────────────────────────────────────
public class UpdateProfileRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Bio { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
