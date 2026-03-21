using api_v2.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using Xunit;

namespace tests.Common;

public class PaginationRequestHandlerTests
{
    [Fact]
    public void GetResultsPerPage_WithLimit_ReturnsLimitValue()
    {
        var query = new QueryCollection(new Dictionary<string, StringValues>
        {
            { "limit", "50" }
        });
        var handler = new PaginationRequestHandler(query, 100);
        Assert.Equal(50, handler.GetResultsPerPage());
    }

    [Fact]
    public void GetResultsPerPage_WithoutLimit_ReturnsDefaultValue()
    {
        var query = new QueryCollection();
        var handler = new PaginationRequestHandler(query, 100);
        Assert.Equal(20, handler.GetResultsPerPage());
    }

    [Fact]
    public void GetResultsPerPage_WithInvalidLimit_ReturnsDefaultValue()
    {
        var query = new QueryCollection(new Dictionary<string, StringValues>
        {
            { "limit", "not-a-number" }
        });
        var handler = new PaginationRequestHandler(query, 100);
        Assert.Equal(20, handler.GetResultsPerPage());
    }

    [Theory]
    [InlineData(100, 20, 5)]
    [InlineData(101, 20, 6)]
    [InlineData(0, 20, 1)]
    [InlineData(19, 20, 1)]
    [InlineData(20, 20, 1)]
    [InlineData(21, 20, 2)]
    public void CalculatePageCount_ReturnsCorrectPageCount(int totalCount, int limit, int expectedPageCount)
    {
        var query = new QueryCollection(new Dictionary<string, StringValues>
        {
            { "limit", limit.ToString() }
        });
        var handler = new PaginationRequestHandler(query, totalCount);
        Assert.Equal(expectedPageCount, handler.CalculatePageCount());
    }

    [Theory]
    [InlineData(100, 20, 0)]
    [InlineData(101, 20, 0)]
    [InlineData(19, 20, 0)]
    public void CalculateOffset_ReturnsFirstPageOffsetByDefault(int totalCount, int limit, int expectedOffset)
    {
        var query = new QueryCollection(new Dictionary<string, StringValues>
        {
            { "limit", limit.ToString() }
        });
        var handler = new PaginationRequestHandler(query, totalCount);
        Assert.Equal(expectedOffset, handler.CalculateOffset());
    }

    [Theory]
    [InlineData(100, 20, 2, 20)]
    [InlineData(101, 20, 6, 100)]
    [InlineData(21, 20, 2, 20)]
    public void CalculateOffset_ReturnsCorrectOffsetForPage(int totalCount, int limit, int page, int expectedOffset)
    {
        var query = new QueryCollection(new Dictionary<string, StringValues>
        {
            { "limit", limit.ToString() },
            { "page", page.ToString() }
        });
        var handler = new PaginationRequestHandler(query, totalCount);
        Assert.Equal(expectedOffset, handler.CalculateOffset());
    }
}
