using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace tests.Controllers;

public class CommentsControllerTests
{
    private sealed class FakeAccessScope(int userId, bool isPrivileged = false, bool canAccessParent = true) : IRequestAccessScope
    {
        public bool IsPrivileged => isPrivileged;
        public bool CanAccessVault => false;
        public int UserId => userId;
        public Task<IReadOnlyList<int>> MemberProjectIdsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<int>>([]);
        public Task<bool> CanAccessProjectAsync(int? projectId, CancellationToken cancellationToken = default) => Task.FromResult(canAccessParent);
        public Task<bool> CanAccessSecretAsync(Secret secret, CancellationToken cancellationToken = default) => Task.FromResult(false);
        public Task<bool> CanAccessParentAsync(string parentType, int parentId, CancellationToken cancellationToken = default) => Task.FromResult(canAccessParent);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static CommentsController CreateController(AppDbContext db, IRequestAccessScope scope, int currentUserId)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Items["DbUser"] = new User { Id = currentUserId };

        return new CommentsController(db, scope)
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };
    }

    [Fact]
    public async Task CreateOne_StoresCommentAsCurrentUser()
    {
        using var db = CreateDbContext();
        db.Users.Add(new User { Id = 7, SubjectId = "subject-7" });
        await db.SaveChangesAsync();
        var controller = CreateController(db, new FakeAccessScope(7), currentUserId: 7);
        var request = new CommentsController.CreateCommentRequest
        {
            ParentType = CommentParentType.Vulnerability,
            ParentId = 3,
            Content = "Confirmed on staging."
        };

        var result = await controller.CreateOne(request);

        var created = Assert.IsType<CreatedResult>(result);
        var response = Assert.IsType<CommentsController.CommentResponse>(created.Value);
        Assert.Equal("vulnerability", response.ParentType);
        Assert.Equal(7, response.CreatedById);
        var stored = await db.Comments.SingleAsync();
        Assert.Equal("Confirmed on staging.", stored.Content);
        Assert.Equal(7, stored.CreatedById);
    }

    [Fact]
    public async Task CreateOne_WithoutParentAccess_ReturnsNotFoundAndStoresNothing()
    {
        using var db = CreateDbContext();
        var controller = CreateController(db, new FakeAccessScope(7, canAccessParent: false), currentUserId: 7);
        var request = new CommentsController.CreateCommentRequest
        {
            ParentType = CommentParentType.Project,
            ParentId = 3,
            Content = "Not allowed."
        };

        var result = await controller.CreateOne(request);

        Assert.IsType<NotFoundResult>(result);
        Assert.Empty(db.Comments);
    }

    [Fact]
    public async Task GetMany_WithUnsupportedParentType_ReturnsBadRequest()
    {
        using var db = CreateDbContext();
        var controller = CreateController(db, new FakeAccessScope(1, isPrivileged: true), currentUserId: 1);

        var result = await controller.GetMany(limit: null, parentType: "asset", parentId: 1);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetMany_WithLimit_ReturnsAtMostLimitComments()
    {
        using var db = CreateDbContext();
        db.Comments.AddRange(
            new Comment { ParentType = "project", ParentId = 1, Content = "old", CreatedById = 1 },
            new Comment { ParentType = "project", ParentId = 1, Content = "new", CreatedById = 1 });
        await db.SaveChangesAsync();
        var controller = CreateController(db, new FakeAccessScope(1, isPrivileged: true), currentUserId: 1);

        var result = await controller.GetMany(limit: 1, parentType: "Project", parentId: 1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var comments = Assert.IsAssignableFrom<IEnumerable<CommentsController.CommentResponse>>(ok.Value).ToList();
        Assert.Single(comments);
    }

    [Fact]
    public async Task GetMany_WithoutParentAccess_ReturnsNotFound()
    {
        using var db = CreateDbContext();
        var controller = CreateController(db, new FakeAccessScope(1, canAccessParent: false), currentUserId: 1);

        var result = await controller.GetMany(limit: null, parentType: "project", parentId: 1);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteOne_ByAuthor_DeletesComment()
    {
        using var db = CreateDbContext();
        db.Comments.Add(new Comment { Id = 1, ParentType = "task", ParentId = 1, Content = "Mine", CreatedById = 5 });
        await db.SaveChangesAsync();
        var controller = CreateController(db, new FakeAccessScope(5), currentUserId: 5);

        var result = await controller.DeleteOne(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(db.Comments);
    }

    [Fact]
    public async Task DeleteOne_ByAnotherRegularUser_ReturnsForbidden()
    {
        using var db = CreateDbContext();
        db.Comments.Add(new Comment { Id = 1, ParentType = "task", ParentId = 1, Content = "Not yours", CreatedById = 5 });
        await db.SaveChangesAsync();
        var controller = CreateController(db, new FakeAccessScope(9), currentUserId: 9);

        var result = await controller.DeleteOne(1);

        Assert.IsType<ForbidResult>(result);
        Assert.Single(db.Comments);
    }

    [Fact]
    public async Task DeleteOne_ByPrivilegedUser_DeletesSomeoneElsesComment()
    {
        using var db = CreateDbContext();
        db.Comments.Add(new Comment { Id = 1, ParentType = "task", ParentId = 1, Content = "Theirs", CreatedById = 5 });
        await db.SaveChangesAsync();
        var controller = CreateController(db, new FakeAccessScope(1, isPrivileged: true), currentUserId: 1);

        var result = await controller.DeleteOne(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(db.Comments);
    }
}
