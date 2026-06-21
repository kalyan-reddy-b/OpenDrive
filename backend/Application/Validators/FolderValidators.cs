using FluentValidation;
using OpenDrive.Application.DTOs.Folder;

namespace OpenDrive.Application.Validators;

public class CreateFolderRequestValidator : AbstractValidator<CreateFolderRequest>
{
    public CreateFolderRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
    }
}
