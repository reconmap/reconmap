import json
import random
import uuid
import base64
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()

def generate_demo_data(num_projects=20):
    data = {}
    
    # Offsets to avoid ID collisions
    USER_OFFSET = 10000
    ORG_OFFSET = 20000
    VULN_CAT_OFFSET = 30000
    PROJ_CAT_OFFSET = 40000
    PROJ_OFFSET = 50000
    TARGET_OFFSET = 100000
    VULN_OFFSET = 200000
    TASK_OFFSET = 300000
    COMMAND_OFFSET = 400000
    USAGE_OFFSET = 410000
    DOC_OFFSET = 500000
    VAULT_OFFSET = 600000
    CUSTOM_FIELD_OFFSET = 700000
    INTEGRATION_OFFSET = 800000
    AUDIT_OFFSET = 900000

    # 1. Users
    num_users = 50
    users = []
    roles = ["administrator", "superuser", "user", "client"]
    used_usernames = set()
    for i in range(1, num_users + 1):
        uid = USER_OFFSET + i
        username = fake.user_name()
        while username in used_usernames:
            username = fake.user_name() + str(random.randint(1, 1000))
        used_usernames.add(username)
        users.append({
            "Id": uid, "FirstName": fake.first_name(), "LastName": fake.last_name(),
            "Email": f"{username}@example.com", "Username": username,
            "Role": random.choice(roles), "Active": True, "TimeZone": "UTC",
            "SubjectId": str(uuid.uuid4())
        })
    data["users"] = users
    uids = [u["Id"] for u in users]

    # 2. Organisations
    num_orgs = 15
    organisations = []
    for i in range(1, num_orgs + 1):
        oid = ORG_OFFSET + i
        organisations.append({
            "Id": oid, "Name": f"{fake.company()} {i}",
            "Kind": "service_provider" if i <= 2 else "client",
            "Address": fake.address(), "Url": fake.url(),
            "CreatedByUid": random.choice(uids)
        })
    data["organisations"] = organisations
    client_oids = [o["Id"] for o in organisations if o["Kind"] == "client"]
    sp_oids = [o["Id"] for o in organisations if o["Kind"] == "service_provider"]

    # 3. Categories
    num_cats = 10
    v_cats = []
    p_cats = []
    for i in range(1, num_cats + 1):
        v_cats.append({"Id": VULN_CAT_OFFSET + i, "Name": f"Vuln Cat {fake.word().capitalize()} {i}", "Description": fake.sentence()})
        p_cats.append({"Id": PROJ_CAT_OFFSET + i, "Name": f"Proj Cat {fake.word().capitalize()} {i}", "Description": fake.sentence()})
    data["vulnerability_categories"] = v_cats
    data["project_categories"] = p_cats
    v_cat_ids = [c["Id"] for c in v_cats]
    p_cat_ids = [c["Id"] for c in p_cats]

    # 4. Custom Fields
    c_fields = []
    for i in range(1, 5):
        c_fields.append({
            "Id": CUSTOM_FIELD_OFFSET + i, "ParentType": "vulnerability",
            "Name": f"custom_field_{i}", "Label": f"External Ref {i}",
            "Kind": random.choice(["text", "integer"]), "Config": "{}"
        })
    data["custom_fields"] = c_fields

    # 5. Commands & Usages
    commands = []
    usages = []
    cmd_names = ["nmap", "gobuster", "nikto", "sqlmap", "ffuf"]
    for i, name in enumerate(cmd_names):
        cid = COMMAND_OFFSET + i + 1
        commands.append({
            "Id": cid, "Name": name, "Description": f"Security tool {name}",
            "CreatedByUid": random.choice(uids)
        })
        for j in range(1, 3):
            usages.append({
                "Id": USAGE_OFFSET + (i * 2) + j, "CommandId": cid,
                "Name": f"{name} scan {j}", "Description": f"Standard {name} scan",
                "ExecutablePath": name, "Arguments": "-v {{Host}}",
                "OutputCapturingMode": "stdout", "CreatedByUid": random.choice(uids)
            })
    data["commands"] = commands
    data["command_usages"] = usages

    # 6. Integrations
    data["jira_integrations"] = [{
        "Id": INTEGRATION_OFFSET + 1, "Name": "Corporate Jira", "Url": "https://jira.example.com",
        "Email": "admin@example.com", "ApiToken": "token123", "ProjectKey": "SEC", "IsEnabled": True
    }]
    data["azure_devops_integrations"] = [{
        "Id": INTEGRATION_OFFSET + 2, "Name": "DevOps Board", "Url": "https://dev.azure.com/org",
        "ProjectName": "Main", "PersonalAccessToken": "pat123", "IsEnabled": True
    }]

    # 7. Projects & Dependencies
    projects = []
    targets = []
    vulns = []
    tasks = []
    docs = []
    vault = []
    audit = []
    
    asset_kinds = ['hostname', 'ip_address', 'port', 'cidr_range', 'url', 'binary', 'path', 'file']
    risks = ["low", "medium", "high", "critical"]
    statuses = ["open", "confirmed", "resolved", "closed"]
    
    for i in range(1, num_projects + 1):
        pid = PROJ_OFFSET + i
        creator = random.choice(uids)
        projects.append({
            "Id": pid, "Name": f"Engagement {fake.word().capitalize()} {i}",
            "Description": fake.text(max_nb_chars=300), "CreatedByUid": creator,
            "ClientId": random.choice(client_oids), "ServiceProviderId": random.choice(sp_oids),
            "CategoryId": random.choice(p_cat_ids), "IsTemplate": False,
            "Visibility": "private", "EngagementStartDate": fake.date_this_year().isoformat(),
            "EngagementEndDate": (datetime.now() + timedelta(days=30)).date().isoformat(),
            "Archived": False
        })
        
        # Vault items for project
        for v in range(1, 3):
            vault.append({
                "Id": VAULT_OFFSET + (i * 10) + v, "OwnerUid": creator, "ProjectId": pid,
                "Type": "password", "Name": f"Credential {v} for Project {i}",
                "Value": base64.b64encode(b"secret_value").decode(),
                "Iv": base64.b64encode(b"123456789012").decode(),
                "Tag": base64.b64encode(b"1234567890123456").decode(),
                "Note": "Auto-generated"
            })

        # Assets
        p_targets = []
        for t in range(1, 4):
            tid = TARGET_OFFSET + (i * 10) + t
            targets.append({
                "Id": tid, "ProjectId": pid, "Name": fake.domain_name(),
                "Kind": random.choice(asset_kinds), "Tags": "[]"
            })
            p_targets.append(tid)

        # Vulnerabilities
        for v in range(1, 6):
            vid = VULN_OFFSET + (i * 20) + v
            vulns.append({
                "Id": vid, "ProjectId": pid, "TargetId": random.choice(p_targets),
                "CreatedByUid": creator, "CategoryId": random.choice(v_cat_ids),
                "Summary": f"{fake.sentence(nb_words=4)} {vid}", "Description": fake.text(),
                "Risk": random.choice(risks), "Status": random.choice(statuses),
                "IsTemplate": False, "Visibility": "private"
            })
            # Document for vulnerability
            docs.append({
                "Id": DOC_OFFSET + (i * 50) + v, "CreatedByUid": creator,
                "ParentType": "vulnerability", "ParentId": vid, "Title": "Evidence",
                "Content": "PoC screenshot and logs go here."
            })

        # Tasks
        for t in range(1, 6):
            tasks.append({
                "Id": TASK_OFFSET + (i * 20) + t, "ProjectId": pid, "CreatedByUid": creator,
                "AssignedToUid": random.choice(uids), "Priority": "medium", "Status": "todo",
                "Summary": f"Task {t} for Project {i}", "Description": fake.sentence()
            })

        # Audit logs for project creation
        audit.append({
            "Id": AUDIT_OFFSET + i, "CreatedByUid": creator, "ClientIp": "127.0.0.1",
            "Action": "Created", "Object": "Project", "Context": json.dumps({"Id": pid})
        })

    data["projects"] = projects
    data["targets"] = targets
    data["vulnerabilities"] = vulns
    data["tasks"] = tasks
    data["documents"] = docs
    data["vault"] = vault
    data["audit_log"] = audit

    return data

if __name__ == "__main__":
    import sys
    num = 20
    if len(sys.argv) > 1: num = int(sys.argv[1])
    print(json.dumps(generate_demo_data(num), indent=2))
