namespace OpenDrive.Application.Common.Responses;

public class PagedResponse<T> : ApiResponse<IEnumerable<T>>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalRecords { get; set; }

    public static PagedResponse<T> SuccessPagedResponse(IEnumerable<T> data, int pageNumber, int pageSize, int totalRecords, string message = "Success")
    {
        return new PagedResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
        };
    }
}
