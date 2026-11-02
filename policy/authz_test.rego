package reconmap.authz

test_user_and_client_can_read_scoped_collections if {
	data.reconmap.authz.allow with input as {
		"user": {"role": "user", "member_project_ids": []},
		"resource": {},
		"resource_type": "findings",
		"method": "GET",
	}

	data.reconmap.authz.allow with input as {
		"user": {"role": "client", "member_project_ids": []},
		"resource": {},
		"resource_type": "comments",
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
		"resource_type": "comments",
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

test_only_privileged_roles_can_manage_webhooks if {
	data.reconmap.authz.allow with input as {
		"user": {"role": "administrator", "member_project_ids": []},
		"resource": {},
		"resource_type": "webhooks",
		"method": "GET",
	}

	data.reconmap.authz.allow with input as {
		"user": {"role": "superuser", "member_project_ids": []},
		"resource": {},
		"resource_type": "webhooks",
		"method": "DELETE",
	}

	not data.reconmap.authz.allow with input as {
		"user": {"role": "user", "member_project_ids": []},
		"resource": {},
		"resource_type": "webhooks",
		"method": "POST",
	}

	not data.reconmap.authz.allow with input as {
		"user": {"role": "client", "member_project_ids": []},
		"resource": {},
		"resource_type": "webhooks",
		"method": "GET",
	}
}

# Project, task, finding and report ids are UUIDs, so membership compares strings.
test_project_membership_uses_uuid_ids if {
	data.reconmap.authz.allow with input as {
		"user": {"role": "user", "member_project_ids": ["018f0000-0000-7000-8000-000000000001"]},
		"resource": {"project_id": "018f0000-0000-7000-8000-000000000001", "id": "4b0f1c22-6a52-4d07-9a4f-2b1f3d4e5a6b"},
		"resource_type": "findings",
		"method": "GET",
	}

	not data.reconmap.authz.allow with input as {
		"user": {"role": "user", "member_project_ids": ["018f0000-0000-7000-8000-000000000001"]},
		"resource": {"project_id": "018f0000-0000-7000-8000-000000000002"},
		"resource_type": "tasks",
		"method": "GET",
	}

	not data.reconmap.authz.allow with input as {
		"user": {"role": "client", "member_project_ids": ["018f0000-0000-7000-8000-000000000001"]},
		"resource": {"project_id": "018f0000-0000-7000-8000-000000000002"},
		"resource_type": "reports",
		"method": "GET",
	}
}
