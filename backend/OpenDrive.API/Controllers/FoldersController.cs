using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenDrive.Application.Common.Requests;
using OpenDrive.Application.DTOs.Folder;
using OpenDrive.Application.Interfaces;

namespace OpenDrive.API.Controllers;

[Authorize]
public class FoldersController : BaseController
{
    private readonly IFolderService _folderService;

    public FoldersController(IFolderService folderService)
    {
        _folderService = folderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFolders([FromQuery] PagedRequest request, [FromQuery] Guid? parentFolderId = null)
    {
        var response = await _folderService.GetFoldersAsync(UserId, request, parentFolderId);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateFolder([FromBody] CreateFolderRequest request)
    {
        var response = await _folderService.CreateFolderAsync(UserId, request);
        if (!response.Success)
            return BadRequest(response);
            
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFolder(Guid id)
    {
        var response = await _folderService.DeleteFolderAsync(UserId, id);
        if (!response.Success)
            return NotFound(response);
            
        return Ok(response);
    }
}
