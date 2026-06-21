using OpenDrive.Domain.Entities;

namespace OpenDrive.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user, string roleName);
    RefreshToken GenerateRefreshToken(Guid userId);
}
