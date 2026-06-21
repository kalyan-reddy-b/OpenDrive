using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.DTOs.Auth;

namespace OpenDrive.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
}
