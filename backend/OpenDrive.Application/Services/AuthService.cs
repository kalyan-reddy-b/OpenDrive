using Microsoft.EntityFrameworkCore;
using OpenDrive.Application.Common.Responses;
using OpenDrive.Application.DTOs.Auth;
using OpenDrive.Application.Interfaces;
using OpenDrive.Domain.Entities;

namespace OpenDrive.Application.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<RefreshToken> _refreshTokenRepository;
    private readonly ITokenService _tokenService;

    public AuthService(
        IRepository<User> userRepository,
        IRepository<Role> roleRepository,
        IRepository<RefreshToken> refreshTokenRepository,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userRepository.Query().FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return ApiResponse<AuthResponse>.ErrorResponse("Email is already taken.");
        }

        var defaultRole = await _roleRepository.Query().FirstOrDefaultAsync(r => r.Name == "User");
        if (defaultRole == null)
        {
            defaultRole = new Role { Name = "User" };
            await _roleRepository.AddAsync(defaultRole);
            await _roleRepository.SaveChangesAsync();
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = defaultRole.Id
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var token = _tokenService.GenerateJwtToken(user, defaultRole.Name);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);
        
        await _refreshTokenRepository.AddAsync(refreshToken);
        await _refreshTokenRepository.SaveChangesAsync();

        return ApiResponse<AuthResponse>.SuccessResponse(new AuthResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            RefreshToken = refreshToken.Token
        });
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.Query()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return ApiResponse<AuthResponse>.ErrorResponse("Invalid credentials.");
        }

        var token = _tokenService.GenerateJwtToken(user, user.Role.Name);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);
        
        await _refreshTokenRepository.AddAsync(refreshToken);
        await _refreshTokenRepository.SaveChangesAsync();

        return ApiResponse<AuthResponse>.SuccessResponse(new AuthResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            RefreshToken = refreshToken.Token
        });
    }
}
