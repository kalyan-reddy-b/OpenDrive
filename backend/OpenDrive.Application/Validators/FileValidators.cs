using FluentValidation;
using OpenDrive.Application.DTOs.File;

namespace OpenDrive.Application.Validators;

public class UploadFileRequestValidator : AbstractValidator<UploadFileRequest>
{
    public UploadFileRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.ContentType).NotEmpty();
        RuleFor(x => x.Size).GreaterThan(0);
    }
}
