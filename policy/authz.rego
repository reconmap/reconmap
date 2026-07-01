package reconmap.authz

default allow := false

# Helper to check if a resource belongs to a project the user is a member of
user_is_member_of_project if {
    input.resource.project_id in input.user.member_project_ids
}

# Helper to check if the user is accessing their own profile
is_own_profile if {
    input.resource.id == input.user.id
}

# 1. Administrator & Superuser
allow if {
    input.user.role in ["administrator", "superuser"]
}

# 2. General Access (Any authenticated user role: administrator, superuser, user, client)
# Allow anyone to manage their own sessions (login/logout)
allow if {
    input.resource_type == "sessions"
}

# Allow anyone to view and edit their own user profile/preferences
allow if {
    input.resource_type == "users"
    is_own_profile
}

# Allow anyone to search
allow if {
    input.resource_type == "searches"
}

# Allow users and clients to manage their own notifications
allow if {
    input.user.role in ["user", "client"]
    input.resource_type == "notifications"
}

# 3. User (Pentester)
allow if {
    input.user.role == "user"
    
    # Can access globally readable resources (like categories, system info)
    globally_readable_resources := ["projectcategories", "vulnerabilitiescategories", "systemdata", "system"]
    input.resource_type in globally_readable_resources
    input.method == "GET"
}

allow if {
    input.user.role == "user"
    
    # Can list and read anything within their assigned projects
    project_scoped_resources := ["projects", "tasks", "vulnerabilities", "reports", "documents", "notes"]
    input.resource_type in project_scoped_resources
    
    # If project_id is provided, check membership
    user_is_member_of_project
}

# Allow listing (GET without specific project ID) for users, 
# relying on the C# API to filter the actual DB results via memberProjectIds
allow if {
    input.user.role == "user"
    input.method == "GET"
    not input.resource.project_id # No specific project_id provided in context
}

allow if {
    input.user.role == "user"
    input.method in ["POST", "PUT", "PATCH", "DELETE"]
    user_is_member_of_project
}

# 4. Client
allow if {
    input.user.role == "client"
    input.method == "GET"
    
    # Clients can read project-scoped data if they are a member
    project_scoped_resources := ["projects", "tasks", "vulnerabilities", "reports", "documents"]
    input.resource_type in project_scoped_resources
    
    # If project_id is provided, check membership
    user_is_member_of_project
}

# Allow listing (GET without specific project ID) for clients,
# relying on the C# API to filter the actual DB results.
allow if {
    input.user.role == "client"
    input.method == "GET"
    not input.resource.project_id
}
