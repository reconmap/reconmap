using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace tests.Infrastructure.Security;

public class RequestAccessScopeTests
{
    private static AppDbContext CreateDbContext() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static RequestAccessScope CreateScope(AppDbContext db, int userId, UserRole role)
    {
        var context = new DefaultHttpContext();
        context.Items["DbUser"] = new User { Id = userId, Role = role, Username = "test", Email = "test@example.invalid" };
        return new RequestAccessScope(db, new HttpContextAccessor { HttpContext = context });
    }

    [Fact]
    public async Task User_can_access_own_or_member_project_secret_but_not_other_secret()
    {
        var db = CreateDbContext();
        db.ProjectMembers.Add(new ProjectMember { UserId = 10, ProjectId = TestIds.Of(100) });
        await db.SaveChangesAsync();
        var scope = CreateScope(db, 10, UserRole.User);

        Assert.True(await scope.CanAccessSecretAsync(new Secret { OwnerId = 10, ProjectId = null }));
        Assert.True(await scope.CanAccessSecretAsync(new Secret { OwnerId = 99, ProjectId = TestIds.Of(100) }));
        Assert.False(await scope.CanAccessSecretAsync(new Secret { OwnerId = 99, ProjectId = TestIds.Of(200) }));
    }

    [Fact]
    public async Task Client_cannot_access_vault_even_when_assigned_to_project()
    {
        var db = CreateDbContext();
        db.ProjectMembers.Add(new ProjectMember { UserId = 10, ProjectId = TestIds.Of(100) });
        await db.SaveChangesAsync();
        var scope = CreateScope(db, 10, UserRole.Client);

        Assert.False(scope.CanAccessVault);
        Assert.False(await scope.CanAccessSecretAsync(new Secret { OwnerId = 10, ProjectId = TestIds.Of(100) }));
    }

    [Fact]
    public async Task Parent_access_is_limited_to_resolvable_member_projects()
    {
        var db = CreateDbContext();
        db.ProjectMembers.Add(new ProjectMember { UserId = 10, ProjectId = TestIds.Of(100) });
        db.Tasks.Add(new ProjectTask { Id = TestIds.Of(1), ProjectId = TestIds.Of(100), Priority = "medium", Status = "todo", Summary = "Scoped task" });
        db.Tasks.Add(new ProjectTask { Id = TestIds.Of(2), ProjectId = TestIds.Of(200), Priority = "medium", Status = "todo", Summary = "Other task" });
        await db.SaveChangesAsync();
        var scope = CreateScope(db, 10, UserRole.User);

        Assert.True(await scope.CanAccessParentAsync("task", TestIds.Of(1)));
        Assert.False(await scope.CanAccessParentAsync("task", TestIds.Of(2)));
        Assert.False(await scope.CanAccessParentAsync("organisation", TestIds.Of(1)));
    }
}
