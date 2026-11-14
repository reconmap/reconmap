---
title: User roles
parent: Users
grand_parent: User manual
---

Reconmap has 3 different roles that give users restricted access to parts of the system. In a nutshell the level of access is:

![Users list](/images/screenshots/users-list.png)

| Role          | Capabilities/Permissions                              |
| ------------- | ----------------------------------------------------- |
| User          | Work on projects, findings and commands        |
| Superuser     | Do anything except from adding or removing users      |
| Administrator | Do anything                                           |

## Changing roles

Only administrators can change the role of a user, and nobody can change their own role, administrators included. To change the role of an administrator, ask another administrator. The role field is disabled in the dashboard when you edit your own account. Requests to `PATCH /api/users/{id}` that change the `role` and come from anyone else are rejected with `403 Forbidden`, and an unknown or malformed role is rejected with `400 Bad Request`.
