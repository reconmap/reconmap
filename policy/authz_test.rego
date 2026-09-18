package reconmap.authz

test_user_and_client_can_read_scoped_collections if {
	data.reconmap.authz.allow with input as {
		"user": {"role": "user", "member_project_ids": []},
		"resource": {},
		"resource_type": "vulnerabilities",
		"method": "GET",
	}

	data.reconmap.authz.allow with input as {
		"user": {"role": "client", "member_project_ids": []},
		"resource": {},
		"resource_type": "notes",
		"method": "GET",
	}
}

test_user_and_client_can_modify_unscoped_attachments_and_notes if {
	data.reconmap.authz.allow with input as {
		"user": {"role": "user", "member_project_ids": []},
		"resource": {},
		"resource_type": "attachments",
		"method": "POST",
	}

	data.reconmap.authz.allow with input as {
		"user": {"role": "client", "member_project_ids": []},
		"resource": {},
		"resource_type": "notes",
		"method": "DELETE",
	}
}

test_only_users_can_access_unscoped_secrets if {
	data.reconmap.authz.allow with input as {
		"user": {"role": "user", "member_project_ids": []},
		"resource": {},
		"resource_type": "secrets",
		"method": "PATCH",
	}

	not data.reconmap.authz.allow with input as {
		"user": {"role": "client", "member_project_ids": []},
		"resource": {},
		"resource_type": "secrets",
		"method": "GET",
	}

	not data.reconmap.authz.allow with input as {
		"user": {"role": "client", "member_project_ids": []},
		"resource": {},
		"resource_type": "secrets",
		"method": "PATCH",
	}
}
