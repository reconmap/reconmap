using api_v2.Controllers;
using api_v2.Domain.Entities;

namespace Tests.Controllers;

public class UsersControllerTests
{
    [Theory]
    [InlineData(UserRole.Administrator, "administrator-group")]
    [InlineData(UserRole.Superuser, "superuser-group")]
    [InlineData(UserRole.User, "user-group")]
    [InlineData(UserRole.Client, "client-group")]
    public void GetKeycloakGroupName_MatchesRealmGroupName(UserRole role, string expected)
    {
        Assert.Equal(expected, UsersController.GetKeycloakGroupName(role));
    }
}
