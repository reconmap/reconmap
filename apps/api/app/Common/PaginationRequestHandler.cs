namespace api_v2.Common;

public class PaginationRequestHandler(IQueryCollection query, int totalCount)
{
    public int GetResultsPerPage()
    {
        return query.TryGetValue("limit", out var limit) && int.TryParse(limit, out var result) ? result : 20;
    }

    public int GetCurrentPage()
    {
        return query.TryGetValue("page", out var page) && int.TryParse(page, out var result) ? Math.Max(1, result) : 1;
    }

    public int CalculateOffset()
    {
        var page = GetCurrentPage();
        var limit = GetResultsPerPage();
        return (page - 1) * limit;
    }

    public int CalculatePageCount()
    {
        return Math.Max(1, (int)Math.Ceiling((double)totalCount / GetResultsPerPage()));
    }
}
