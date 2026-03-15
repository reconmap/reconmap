namespace api_v2.Common;

public class PaginationRequestHandler(IQueryCollection query, int totalCount)
{
    public int GetResultsPerPage()
    {
        return query.TryGetValue("limit", out var limit) && int.TryParse(limit, out var result) ? result : 20;
    }

    public int CalculateOffset()
    {
        return (CalculatePageCount() - 1) * GetResultsPerPage();
    }

    public int CalculatePageCount()
    {
        return Math.Max(1, (int)Math.Ceiling((double)totalCount / GetResultsPerPage()));
    }
}
