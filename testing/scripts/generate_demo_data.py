#!/usr/bin/env python3
"""Generates realistic demo data for the Reconmap system data importer.

The output is a JSON object keyed by entity name, ordered so that parents are
imported before children. Keys and values follow the entity shapes in
src/server/Api/Domain/Entities, so the file can be posted to
POST /api/system/data as-is.

Vulnerability and project categories are not generated. They are seeded by
infra/postgres/initdb/sql/02-default-data.sql with unique names, so the
generated data references their ids instead. The seeded organisation (id 1,
"Reconmap") and admin user (id 1) are reused as well.

Usage: generate_demo_data.py [projects] [--seed N]
"""
import argparse
import json
import os
import random
import time
import uuid
from datetime import datetime, timedelta, timezone

from faker import Faker

fake = Faker()

# Ids of the rows seeded by infra/postgres/initdb/sql/02-default-data.sql.
SEED_ADMIN_ID = 1
SEED_SERVICE_PROVIDER_ID = 1
SEED_PROJECT_CATEGORY_IDS = list(range(1, 9))
SEED_VULN_CATEGORY_IDS = {
    "General": 1,
    "Access Controls": 2,
    "Auditing and Logging": 3,
    "Authentication": 4,
    "Configuration": 5,
    "Cryptography": 6,
    "Data Exposure": 7,
    "Data Validation": 8,
    "Denial of Service": 9,
    "Error Reporting": 10,
    "Patching": 11,
    "Session Management": 12,
    "Timing": 13,
}

ENGAGEMENTS = [
    "External Network Penetration Test",
    "Web Application Security Assessment",
    "Internal Infrastructure Review",
    "Cloud Configuration Review",
    "Mobile Application Security Test",
    "API Security Assessment",
    "Red Team Exercise",
    "Wireless Security Assessment",
]

TASK_SUMMARIES = [
    "Confirm scope and rules of engagement",
    "Passive reconnaissance and OSINT",
    "Enumerate subdomains and DNS records",
    "Port scan in-scope hosts",
    "Review TLS configuration",
    "Test authentication and session handling",
    "Check access controls on core resources",
    "Test input validation on forms and APIs",
    "Review security headers and cookies",
    "Draft executive summary",
    "Peer review of findings",
    "Retest remediated findings",
]

# Summary, category, CVSS score, CVSS vector, description, impact, remediation, remediation complexity, proof of concept.
FINDINGS = [
    ("SQL injection in product search parameter", "Data Validation", 9.8,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
     "The q parameter of the product search endpoint is concatenated into a SQL query without parameterisation. "
     "A single quote returns a database error, and boolean payloads change the result set.",
     "An unauthenticated attacker can read or modify arbitrary database content, and may escalate to operating "
     "system access depending on database privileges.",
     "Use parameterised queries for every database call that includes user input. Restrict the database account "
     "to the privileges the application needs.",
     "medium", "GET /search?q=' OR '1'='1 returns the full product catalogue, including hidden items."),
    ("Default credentials on administrative interface", "Authentication", 9.8,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
     "The administration console accepts the vendor default username and password. The login succeeded with the "
     "documented defaults.",
     "Full administrative control of the platform, including user management and configuration.",
     "Force a password change on first login, remove default accounts, and restrict the console to a management "
     "network.",
     "low", "POST /admin/login with admin:admin returns a 302 redirect to /admin/dashboard."),
    ("Unrestricted file upload allows server-side script execution", "Data Validation", 9.9,
     "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H",
     "The avatar upload accepts arbitrary file extensions and stores files in a web-accessible directory. "
     "Uploaded PHP files are executed when requested.",
     "An authenticated user can run arbitrary code on the web server.",
     "Validate file types on the server, store uploads outside the web root, and serve them with a non-executable "
     "content type.",
     "medium", "Uploaded shell.php was requested from /uploads/shell.php and returned command output."),
    ("Subdomain takeover via dangling CNAME record", "Configuration", 7.1,
     "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:H/A:N",
     "A CNAME record points to a deprovisioned cloud storage bucket. Anyone can claim the bucket and serve content "
     "under the company's domain.",
     "Attackers can host phishing pages or steal session cookies scoped to the parent domain.",
     "Remove DNS records that point to unused resources, and audit DNS zones on a regular schedule.",
     "low", "dig CNAME assets.example.com returned a NoSuchBucket error from the storage provider."),
    ("Broken object-level authorisation on invoice endpoint", "Access Controls", 6.5,
     "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",
     "The invoice API returns any invoice when given its numeric id, without checking that it belongs to the "
     "caller's organisation.",
     "Authenticated users can read invoices belonging to other customers.",
     "Check ownership of each requested object against the authenticated user's organisation on the server side.",
     "medium", "GET /api/invoices/1042 with a token from another tenant returned the invoice."),
    ("Reflected cross-site scripting in error page", "Data Validation", 6.1,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
     "The requested path is echoed into the 404 page without encoding, so script tags in the URL execute in the "
     "victim's browser.",
     "Attackers can run script in the context of a victim who follows a crafted link.",
     "Encode all output rendered in HTML, and apply a restrictive Content-Security-Policy.",
     "low", "GET /<script>alert(document.domain)</script> rendered the script unencoded."),
    ("Session cookie missing Secure and HttpOnly flags", "Session Management", 5.3,
     "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
     "The session cookie is set without the Secure and HttpOnly attributes, so it is sent over plain HTTP and is "
     "readable from JavaScript.",
     "Session tokens can be intercepted on unencrypted connections or stolen through script injection.",
     "Set the Secure, HttpOnly, and SameSite attributes on all session cookies.",
     "low", "Set-Cookie: session=... returned without Secure or HttpOnly flags."),
    ("Weak TLS protocol versions enabled", "Cryptography", 5.9,
     "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N",
     "The HTTPS endpoint accepts TLS 1.0 and TLS 1.1, which are deprecated and vulnerable to known downgrade and "
     "cipher attacks.",
     "Encrypted traffic may be exposed to a network attacker who can force a weak protocol version.",
     "Disable TLS 1.0 and 1.1, and allow only modern cipher suites with forward secrecy.",
     "low", "testssl reported TLS 1.0 and TLS 1.1 as offered on port 443."),
    ("Missing rate limiting on login endpoint", "Authentication", 5.3,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L",
     "The login endpoint accepts unlimited password attempts from a single address, with no lockout or delay.",
     "Weak or leaked passwords can be guessed by automated attacks.",
     "Apply rate limits per account and per source address, and add progressive delays after repeated failures.",
     "medium", "250 login attempts in 60 seconds were all processed without throttling."),
    ("Directory listing enabled on static assets", "Data Exposure", 5.3,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
     "The web server returns a directory index for the /static/ path, exposing file names and internal build "
     "artefacts.",
     "Attackers can discover unlinked files and backups that may contain sensitive information.",
     "Disable directory indexing in the web server configuration.",
     "low", "GET /static/ returned an index page listing 37 files."),
    ("Verbose stack traces disclosed on application errors", "Error Reporting", 3.7,
     "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
     "Unhandled exceptions return full stack traces, framework versions, and internal file paths to the client.",
     "Detailed errors help attackers map the application and choose targeted exploits.",
     "Return generic error messages to clients, and log details server-side only.",
     "low", "Sending a malformed JSON body returned a stack trace with /srv/app/src paths."),
    ("Clickjacking possible due to missing frame protections", "Configuration", 4.3,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N",
     "Responses do not include X-Frame-Options or a frame-ancestors directive, so pages can be embedded in a "
     "malicious site.",
     "Users can be tricked into clicking actions on the application while it is hidden in a frame.",
     "Send X-Frame-Options: DENY, or use a Content-Security-Policy frame-ancestors directive.",
     "low", "The sensitive settings page loaded inside an iframe on an attacker-controlled page."),
    ("Race condition in coupon redemption", "Timing", 6.5,
     "CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:H/A:N",
     "Sending concurrent redemption requests for a single-use coupon applies the discount more than once.",
     "Customers can obtain discounts beyond the intended limit.",
     "Enforce single use with a database constraint or a transactional update that checks the remaining uses.",
     "medium", "Twenty parallel redemption requests for coupon SPRING24 all returned success."),
    ("Denial of service through unbounded GraphQL query depth", "Denial of Service", 7.5,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
     "The GraphQL endpoint accepts deeply nested queries without a depth or complexity limit, which exhausts server "
     "CPU and memory.",
     "A single unauthenticated request can make the API unresponsive.",
     "Set maximum query depth and complexity limits, and enforce a request timeout.",
     "medium", "A query nested 60 levels deep raised CPU usage to 100% for 40 seconds."),
    ("Authentication failures are not logged", "Auditing and Logging", 3.1,
     "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L",
     "Failed login attempts do not produce log entries, so brute-force activity cannot be detected or investigated.",
     "Ongoing attacks against user accounts go unnoticed.",
     "Log authentication successes and failures with the source address and timestamp, and forward the logs to a "
     "central system.",
     "low", "No log entries were written after 50 failed logins in the application log."),
    ("Hardcoded API key in public JavaScript bundle", "Data Exposure", 7.5,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
     "A third-party API key with write scope is embedded in the minified frontend bundle served to every visitor.",
     "Anyone can use the key to access the third-party service under the company's account.",
     "Revoke the key, rotate it, and move it to a server-side secret store. Restrict key scopes to the minimum "
     "needed.",
     "low", "The key was found by searching main.8f2a1c.js for the prefix sk_live_."),
    ("Outdated OpenSSH version exposed on SSH service", "Patching", 5.3,
     "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
     "The SSH banner reports OpenSSH 7.4, which is several years behind the current release and has known "
     "vulnerabilities.",
     "Vulnerable service versions may be exploited if a matching flaw is available.",
     "Upgrade OpenSSH to a supported release, and enable automatic security updates.",
     "medium", "Banner grab on port 22 returned SSH-2.0-OpenSSH_7.4."),
    ("Sensitive backup file exposed", "Data Exposure", 7.5,
     "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
     "A database backup named backup.sql.gz is reachable from the web root without authentication.",
     "The backup contains customer records and password hashes.",
     "Remove the backup from the web root, and store backups in private storage with access controls.",
     "low", "GET /backup.sql.gz returned a 200 response with a 48 MB archive."),
    ("Security headers missing on responses", "Configuration", 3.1,
     "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N",
     "Responses lack Content-Security-Policy, Strict-Transport-Security, and X-Content-Type-Options headers.",
     "The absence of these headers weakens defences against script injection and protocol downgrade attacks.",
     "Add the missing headers at the reverse proxy, and verify them with a scanner after each release.",
     "low", "shcheck reported 3 missing security headers on https://app.example.com/."),
]

RUN_TOOLS = [
    {
        "command_id": "subfinder", "command_name": "Subfinder", "usage_id": "subfinder-subdomains",
        "executable": "subfinder", "arguments": "-d {target} -o reconmap-subfinder-output.jsonl -oJ -nW",
        "target_type": "hostname", "rationale": "Enumerate subdomains from passive sources to widen the attack surface.",
    },
    {
        "command_id": "nmap", "command_name": "Nmap", "usage_id": "nmap-tcp-syn",
        "executable": "nmap", "arguments": "-oX - {target}",
        "target_type": "hostname", "rationale": "Identify open TCP services on in-scope hosts.",
    },
    {
        "command_id": "testssl", "command_name": "Testssl", "usage_id": "testssl-scan",
        "executable": "testssl", "arguments": "--jsonfile testssl-output.json {target}",
        "target_type": "hostname", "rationale": "Check TLS protocols, ciphers, and certificate configuration.",
    },
    {
        "command_id": "shcheck", "command_name": "Shcheck", "usage_id": "shcheck-headers",
        "executable": "shcheck.py", "arguments": "-j {target}",
        "target_type": "url", "rationale": "Check for missing or weak security headers on the web application.",
    },
]

USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/130.0.0.0 Safari/537.36",
]

SCHEDULE_CRONS = ["0 2 * * 1", "30 6 * * *", "0 0 1 * *"]

ACTIONS = [
    ("Created", "Project"), ("Updated", "Project"), ("Created", "Vulnerability"),
    ("Updated", "Vulnerability"), ("Created", "Task"), ("Updated", "Task"),
    ("Created", "Asset"), ("Exported", "System Data"),
]


class IdSequence:
    """Hands out ids for one table, starting above the seed data so imports never collide with it."""

    def __init__(self, start=1000):
        self._next = start

    def next(self):
        value = self._next
        self._next += 1
        return value


class UuidV7Ids:
    """Hands out time-ordered UUIDv7 ids, like Guid.CreateVersion7 in the server (used for projects, tasks and reports)."""

    def next(self):
        millis = time.time_ns() // 1_000_000
        rand = int.from_bytes(os.urandom(10), "big")
        rand_a = (rand >> 68) & 0xFFF
        rand_b = rand & ((1 << 62) - 1)
        value = ((millis & ((1 << 48) - 1)) << 80) | (0x7 << 76) | (rand_a << 64) | (0b10 << 62) | rand_b
        return str(uuid.UUID(int=value))


class UuidV4Ids:
    """Hands out random UUIDv4 ids, which carry no creation time (used for vulnerabilities)."""

    def next(self):
        return str(uuid.uuid4())


def utc_now():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def risk_for_score(score):
    if score >= 9.0:
        return "critical"
    if score >= 7.0:
        return "high"
    if score >= 4.0:
        return "medium"
    return "low"


def remediation_priority_for(risk):
    return {"critical": "high", "high": "high", "medium": "medium", "low": "low"}[risk]


def run_status(task_statuses):
    """Mirrors ScanRun.RecomputeStatus in the server."""
    if not task_statuses:
        return "queued"
    if any(s in ("queued", "running") for s in task_statuses):
        return "running" if any(s != "queued" for s in task_statuses) else "queued"
    failed = task_statuses.count("failed")
    if failed == 0:
        return "succeeded"
    if failed == len(task_statuses):
        return "failed"
    return "partial"


def unique_name(name, used):
    candidate = name
    suffix = 2
    while candidate in used:
        candidate = f"{name} ({suffix})"
        suffix += 1
    used.add(candidate)
    return candidate


def generate_users(count, ids):
    users = []
    used_usernames = set()
    for _ in range(count):
        username = fake.user_name()
        while username in used_usernames:
            username = f"{fake.user_name()}{random.randint(1, 999)}"
        used_usernames.add(username)
        users.append({
            "Id": ids.next(),
            "SubjectId": str(uuid.uuid4()),
            "Role": random.choices(["administrator", "superuser", "user", "client"], weights=[1, 3, 20, 4])[0],
            "ShortBio": fake.sentence(nb_words=12),
            "Username": username,
            "Email": f"{username}@example.com",
            "FirstName": fake.first_name(),
            "LastName": fake.last_name(),
            "TimeZone": "UTC",
            "Active": True,
        })
    return users


def generate_clients(count, ids):
    clients = []
    used_names = set()
    for _ in range(count):
        clients.append({
            "Id": ids.next(),
            "Type": "client",
            "Name": unique_name(fake.company(), used_names)[:80],
            "Address": fake.address().replace("\n", ", ")[:400],
            "Url": fake.url()[:255],
            "CreatedById": SEED_ADMIN_ID,
        })
    return clients


def generate_custom_fields():
    return [
        {"Id": 1000, "ParentType": "vulnerability", "Name": "cve_id", "Label": "CVE ID", "Type": "text", "Config": "{}"},
        {"Id": 1001, "ParentType": "vulnerability", "Name": "cwe_id", "Label": "CWE ID", "Type": "text", "Config": "{}"},
        {"Id": 1002, "ParentType": "vulnerability", "Name": "ticket_reference", "Label": "Ticket reference",
         "Type": "text", "Config": "{}"},
        {"Id": 1003, "ParentType": "vulnerability", "Name": "affected_instances", "Label": "Affected instances",
         "Type": "integer", "Config": "{}"},
    ]


def generate_projects(count, clients, staff_ids, ids):
    projects = []
    used_names = set()
    today = utc_now().date()
    for _ in range(count):
        client = random.choice(clients)
        start = today + timedelta(days=random.randint(-400, 60))
        end = start + timedelta(days=random.randint(7, 45))
        archived = end < today
        engagement = random.choice(ENGAGEMENTS)
        projects.append({
            "Id": ids.next(),
            "Name": unique_name(f"{client['Name']} {engagement}", used_names)[:200],
            "Description": fake.paragraph(nb_sentences=3),
            "CreatedById": random.choice(staff_ids),
            "ServiceProviderId": SEED_SERVICE_PROVIDER_ID,
            "ClientId": client["Id"],
            "CategoryId": random.choice(SEED_PROJECT_CATEGORY_IDS),
            "IsTemplate": False,
            "Visibility": random.choice(["private", "private", "public"]),
            "EngagementStartDate": start.isoformat(),
            "EngagementEndDate": end.isoformat(),
            "Archived": archived,
            "ArchivedAt": iso(datetime.combine(end, datetime.min.time(), tzinfo=timezone.utc)) if archived else None,
            "_archived": archived,
            "_start": start,
            "_end": end,
        })
    return projects


def generate_members(project, staff_ids, ids):
    members = []
    for user_id in random.sample(staff_ids, k=min(len(staff_ids), random.randint(2, 4))):
        members.append({"Id": ids.next(), "ProjectId": project["Id"], "UserId": user_id})
    return members


SUBDOMAINS = ["app", "api", "www", "admin", "staging", "dev", "vpn", "mail", "git", "ci", "grafana", "files",
              "portal", "shop", "auth", "cdn", "db", "internal"]
SERVICES = {
    22: ("ssh", ["OpenSSH 8.9p1", "OpenSSH 7.4"]),
    25: ("smtp", ["Postfix smtpd"]),
    80: ("http", ["nginx 1.18.0", "Apache httpd 2.4.41"]),
    443: ("https", ["nginx 1.22.1", "Apache httpd 2.4.54", "Microsoft IIS 10.0"]),
    3306: ("mysql", ["MySQL 5.7.38", "MariaDB 10.6"]),
    5432: ("postgresql", ["PostgreSQL 13.4"]),
    6379: ("redis", ["Redis 6.2.6"]),
    8080: ("http-proxy", ["Jetty 9.4", "Apache Tomcat 9.0"]),
    8443: ("https-alt", ["nginx 1.22.1"]),
    9200: ("elasticsearch", ["Elasticsearch 7.10"]),
}
WEB_PORTS = (80, 443, 8080, 8443)
WEB_PATHS = {
    "/admin": [("/admin/login", 200), ("/admin/users", 403), ("/admin/config.php", 200)],
    "/api": [("/api/v1", 200), ("/api/v1/users", 401), ("/api/v1/orders", 401), ("/api/docs", 200),
             ("/api/health", 200)],
    "/login": [],
    "/static": [("/static/js", 200), ("/static/css", 200), ("/static/js/app.js.map", 200)],
    "/uploads": [("/uploads/avatars", 200), ("/uploads/invoices", 403)],
    "/backup": [("/backup/db.sql.gz", 200), ("/backup/site.zip", 200)],
    "/.git": [("/.git/HEAD", 200), ("/.git/config", 200)],
    "/wp-admin": [("/wp-admin/admin-ajax.php", 200), ("/wp-admin/install.php", 200)],
}
LEAKY_FILES = [("/.env", "text/plain"), ("/.git/config", "text/plain"), ("/phpinfo.php", "text/html"),
               ("/server-status", "text/html"), ("/config.json", "application/json"),
               ("/id_rsa", "application/octet-stream"), ("/robots.txt", "text/plain"),
               ("/.DS_Store", "application/octet-stream"), ("/swagger.json", "application/json")]
PACKAGES = ["lodash@4.17.15", "express@4.16.0", "log4j-core@2.14.1", "jackson-databind@2.9.8", "django@2.2.0",
            "requests@2.19.0", "openssl@1.1.1k", "minimist@1.2.0", "axios@0.21.0", "spring-core@5.2.0"]


def generate_assets(project, ids):
    """Builds a large asset tree for visualisation.

    domain > subdomain host > port > web app url > path > nested path / file, plus an IP range holding
    hosts with open services, and a source repository holding packages.
    """
    domain = fake.domain_name()
    tags_pool = [["production"], ["staging"], ["internal"], ["legacy"], ["external"], ["cloud"], []]
    now = iso(utc_now())
    assets = []

    def add(name, type, parent=None, attributes=None, source="demo", tags=None):
        asset = {
            "Id": ids.next(),
            "ParentId": parent["Id"] if parent else None,
            "ProjectId": project["Id"],
            "Name": name,
            "Type": type,
            "Source": source,
            "Attributes": json.dumps(attributes) if attributes else None,
            "Tags": json.dumps(tags if tags is not None else random.choice(tags_pool)),
            "FirstSeenAt": now,
            "LastSeenAt": now,
        }
        assets.append(asset)
        return asset

    def add_ports(host, source, web_prefix):
        for port in random.sample(sorted(SERVICES), k=random.randint(2, 6)):
            service, versions = SERVICES[port]
            port_asset = add(f"{port}/tcp", "port", host,
                             {"port": port, "protocol": "tcp", "service": service,
                              "product": random.choice(versions)}, source, [])
            if port in WEB_PORTS:
                scheme = "https" if port in (443, 8443) else "http"
                suffix = "" if port in (80, 443) else f":{port}"
                webapp = add(f"{scheme}://{web_prefix}{suffix}", "url", port_asset,
                             {"title": fake.catch_phrase(), "status": 200}, "httpx", [])
                add_web_content(webapp)

    def add_web_content(webapp):
        for path in random.sample(sorted(WEB_PATHS), k=random.randint(2, 6)):
            path_asset = add(path, "path", webapp, {"status": random.choice([200, 301, 302, 403])}, "ffuf", [])
            for child, status in WEB_PATHS[path]:
                if random.random() < 0.7:
                    type = "file" if "." in child.rsplit("/", 1)[-1] else "path"
                    add(child, type, path_asset, {"status": status}, "ffuf", [])
        for name, content_type in random.sample(LEAKY_FILES, k=random.randint(0, 3)):
            add(name, "file", webapp, {"status": 200, "content_type": content_type, "size": random.randint(60, 90000)},
                "nuclei", ["exposed"])

    root = add(domain, "domain", tags=["external"])
    for sub in random.sample(SUBDOMAINS, k=random.randint(6, 12)):
        name = f"{sub}.{domain}"
        host = add(name, "hostname", root, {"resolves_to": fake.ipv4_public()}, "subfinder")
        add_ports(host, "nmap", name)

    network = add(f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.0/24", "cidr_range", tags=["internal"])
    for last_octet in random.sample(range(2, 250), k=random.randint(5, 10)):
        ip = add(network["Name"].rsplit(".", 1)[0] + f".{last_octet}", "ip_address", network,
                 {"os": random.choice(["Linux 5.x", "Windows Server 2019", "FreeBSD 13"])}, "nmap")
        add_ports(ip, "nmap", ip["Name"])

    repo = add(f"git.{domain}/platform/backend", "repository", tags=["code"])
    manifest = add("package.json", "file", repo, source="syft", tags=[])
    for package in random.sample(PACKAGES, k=random.randint(4, 8)):
        add(package, "package", manifest, {"purl": f"pkg:generic/{package}"}, "syft", ["dependency"])
    return assets, domain


def generate_tasks(project, members, ids):
    tasks = []
    for summary in random.sample(TASK_SUMMARIES, k=random.randint(4, 8)):
        if project["_archived"]:
            status = "done"
        else:
            status = random.choices(["todo", "doing", "done"], weights=[3, 2, 2])[0]
        tasks.append({
            "Id": ids.next(),
            "ProjectId": project["Id"],
            "CreatedById": project["CreatedById"],
            "AssignedToId": random.choice(members)["UserId"],
            "Priority": random.choice(["highest", "high", "medium", "low", "lowest"]),
            "Summary": summary,
            "Description": fake.sentence(nb_words=12),
            "Status": status,
            "DurationEstimate": random.randint(1, 16),
            "DueDate": (project["_start"] + timedelta(days=random.randint(3, 30))).isoformat(),
        })
    return tasks


def finding_row(finding, project_id, asset_id, created_by_id, ids, archived=False, is_template=False):
    summary, category, score, vector, description, impact, remediation, complexity, poc = finding
    risk = risk_for_score(score)
    if is_template:
        status, substatus = "open", "reported"
    elif archived:
        status, substatus = random.choice([("resolved", "remediated"), ("resolved", "mitigated"),
                                           ("closed", "rejected"), ("closed", "remediated")])
    else:
        status, substatus = random.choice([("open", "reported"), ("open", "unresolved"),
                                           ("confirmed", "exploited"), ("confirmed", "unexploited")])
    return {
        "Id": ids.next(),
        "CreatedById": created_by_id,
        "IsTemplate": is_template,
        "ProjectId": project_id,
        "AssetId": asset_id,
        "CategoryId": SEED_VULN_CATEGORY_IDS[category],
        "Summary": summary,
        "Description": description,
        "Visibility": "private",
        "Risk": risk,
        "ProofOfConcept": poc,
        "Impact": impact,
        "Remediation": remediation,
        "RemediationComplexity": complexity,
        "RemediationPriority": remediation_priority_for(risk),
        "CvssVector": vector,
        "CvssScore": score,
        "Status": status,
        "Substatus": substatus,
        "Tags": json.dumps(random.sample(["web", "network", "owasp-top-10", "quick-win", "cloud"], k=2)),
    }


def generate_vulnerabilities(project, assets, ids):
    vulns = []
    for finding in random.sample(FINDINGS, k=random.randint(3, 10)):
        asset = random.choice(assets) if assets and random.random() < 0.8 else None
        vulns.append(finding_row(finding, project["Id"], asset["Id"] if asset else None,
                                 project["CreatedById"], ids, archived=project["_archived"]))
    return vulns


def generate_reports(projects, ids):
    return [
        {
            "Id": ids.next(),
            "ProjectId": project["Id"],
            "CreatedById": project["CreatedById"],
            "IsTemplate": False,
            "VersionName": random.choice(["v1.0 draft", "v1.1 review", "Final"]),
            "VersionDescription": fake.sentence(nb_words=8),
        }
        for project in projects
    ]


def generate_scan_runs(project, domain, members, ids, task_ids):
    runs = []
    for _ in range(random.randint(0, 2)):
        target_type = random.choice(["hostname", "url"])
        target = f"app.{domain}" if target_type == "hostname" else f"https://app.{domain}/"
        tools = [t for t in RUN_TOOLS if t["target_type"] == target_type]
        chosen = random.sample(tools, k=min(len(tools), random.randint(1, 3)))
        state = random.choices(["finished", "running", "queued"], weights=[6, 2, 1])[0]
        run_id = ids.next()
        run_tasks = []
        for position, tool in enumerate(chosen):
            if state == "queued":
                status, started, finished, error = "queued", None, None, None
            elif state == "running" and position == 0:
                status, started, finished, error = "succeeded", utc_now() - timedelta(minutes=12), utc_now() - timedelta(minutes=6), None
            elif state == "running" and position == 1:
                status, started, finished, error = "running", utc_now() - timedelta(minutes=5), None, None
            elif state == "running":
                status, started, finished, error = "queued", None, None, None
            else:
                failed = random.random() < 0.2
                status = "failed" if failed else "succeeded"
                started = utc_now() - timedelta(days=random.randint(1, 20), minutes=random.randint(0, 600))
                finished = started + timedelta(minutes=random.randint(1, 25))
                error = "Process exited with code 1: target unreachable" if failed else None
            run_tasks.append({
                "Id": task_ids.next(),
                "ScanRunId": run_id,
                "Position": position,
                "CommandId": tool["command_id"],
                "CommandName": tool["command_name"],
                "CommandUsageId": tool["usage_id"],
                "ExecutablePath": tool["executable"],
                "Arguments": tool["arguments"].format(target=target),
                "Rationale": tool["rationale"],
                "Status": status,
                "Error": error,
                "StartedAt": iso(started) if started else None,
                "FinishedAt": iso(finished) if finished else None,
            })
        runs.append({
            "Id": run_id,
            "ProjectId": project["Id"],
            "CreatedById": random.choice(members)["UserId"],
            "Target": target,
            "TargetType": target_type,
            "Objective": random.choice(["Discover attack surface", "Identify exposed services",
                                        "Check security headers", "Verify TLS configuration"]),
            "Strategy": fake.sentence(nb_words=14),
            "Status": run_status([t["Status"] for t in run_tasks]),
            "Tasks": run_tasks,
        })
    return runs


def generate_runners(count, ids):
    runners = []
    oses = ["Ubuntu 24.04 LTS", "Debian 12", "Fedora 41"]
    cpus = ["Intel(R) Xeon(R) CPU E5-2680 v4", "AMD EPYC 7452", "Intel(R) Core(TM) i7-1260P"]
    for i in range(count):
        active = random.random() < 0.8
        last_ping = utc_now() - timedelta(seconds=random.randint(5, 60)) if active else utc_now() - timedelta(days=random.randint(1, 9))
        runners.append({
            "Id": ids.next(),
            "Name": f"runner-{['eu-west', 'us-east', 'office'][i % 3]}-{i + 1}",
            "ClientId": str(uuid.uuid4()),
            "LastBootAt": iso(last_ping - timedelta(days=random.randint(1, 30))),
            "LastPingAt": iso(last_ping),
            "Active": active,
            "Version": random.choice(["1.4.2", "1.4.3", "1.5.0"]),
            "Hostname": f"scanner-{i + 1:02d}.internal",
            "Arch": "amd64",
            "Cpu": random.choice(cpus),
            "Memory": random.choice(["8 GB", "16 GB", "32 GB"]),
            "Os": random.choice(oses),
            "Ip": fake.ipv4_private(),
            "ListenAddr": "0.0.0.0:8443",
        })
    return runners


def generate_comments(vulns, projects, users, ids):
    comments = []
    for vuln in random.sample(vulns, k=len(vulns) // 3):
        comments.append({
            "Id": ids.next(),
            "CreatedById": random.choice(users)["Id"],
            "ParentType": "vulnerability",
            "ParentId": vuln["Id"],
            "Content": fake.paragraph(nb_sentences=2),
        })
    for project in projects:
        comments.append({
            "Id": ids.next(),
            "CreatedById": project["CreatedById"],
            "ParentType": "project",
            "ParentId": project["Id"],
            "Content": fake.paragraph(nb_sentences=2),
        })
    return comments


def generate_notifications(users, projects, ids):
    titles = ["Task assigned to you", "Vulnerability status changed", "Scan completed", "Report generated"]
    notifications = []
    for user in random.sample(users, k=len(users) // 2):
        for _ in range(random.randint(1, 3)):
            project = random.choice(projects)
            notifications.append({
                "Id": ids.next(),
                "ToUserId": user["Id"],
                "Title": random.choice(titles),
                "Content": f"Activity in project {project['Name']}.",
                "Status": random.choice(["unread", "read"]),
            })
    return notifications


def generate_command_schedules(projects, ids):
    schedules = []
    for project, cron in zip([p for p in projects if not p["_archived"]], SCHEDULE_CRONS * 2):
        tool = random.choice(RUN_TOOLS)
        schedules.append({
            "Id": ids.next(),
            "CreatedById": project["CreatedById"],
            "CommandId": tool["command_id"],
            "CommandUsageId": tool["usage_id"],
            "ProjectId": project["Id"],
            "ArgumentValues": tool["arguments"].format(target=f"app.{fake.domain_name()}"),
            "CronExpression": cron,
        })
    return schedules


def generate_webhooks(ids):
    return [
        {"Id": ids.next(), "Name": "Chat notifications", "Url": "https://hooks.example.com/services/T0000/B0000/XXXX",
         "Secret": fake.sha1(), "IsEnabled": True, "Events": "project.created,vulnerability.created"},
        {"Id": ids.next(), "Name": "Ticketing sync", "Url": "https://tickets.example.com/api/reconmap",
         "Secret": None, "IsEnabled": False, "Events": "vulnerability.created"},
    ]


def generate_audit_log(projects, vulns, users, count, ids):
    entries = []
    for _ in range(count):
        action, obj = random.choice(ACTIONS)
        if obj == "Project":
            object_id = random.choice(projects)["Id"]
        elif obj == "Vulnerability" and vulns:
            object_id = random.choice(vulns)["Id"]
        else:
            object_id = random.randint(1000, 1999)
        entries.append({
            "Id": ids.next(),
            "CreatedById": random.choice(users)["Id"],
            "UserAgent": random.choice(USER_AGENTS),
            "ClientIp": fake.ipv4_private(),
            "Action": action,
            "Object": obj,
            "Context": json.dumps({"Id": object_id}),
        })
    return entries


def generate_demo_data(num_projects=20, seed=None):
    if seed is not None:
        random.seed(seed)
        Faker.seed(seed)

    user_ids = IdSequence()
    client_ids = IdSequence()
    project_ids = UuidV7Ids()
    member_ids = IdSequence()
    asset_ids = UuidV7Ids()
    task_ids = UuidV7Ids()
    vuln_ids = UuidV4Ids()
    comment_ids = IdSequence()
    report_ids = UuidV7Ids()
    runner_ids = IdSequence()
    scan_ids = IdSequence()
    scan_task_ids = IdSequence()
    schedule_ids = IdSequence()
    notification_ids = IdSequence()
    webhook_ids = IdSequence()
    audit_ids = IdSequence()

    users = generate_users(40, user_ids)
    staff = [u for u in users if u["Role"] != "client"]
    staff_ids = [u["Id"] for u in staff] + [SEED_ADMIN_ID]
    clients = generate_clients(12, client_ids)
    custom_fields = generate_custom_fields()

    projects = generate_projects(num_projects, clients, staff_ids, project_ids)

    members, tasks, assets, vulns, scans = [], [], [], [], []
    for project in projects:
        project_members = generate_members(project, staff_ids, member_ids)
        members.extend(project_members)
        tasks.extend(generate_tasks(project, project_members, task_ids))
        project_assets, domain = generate_assets(project, asset_ids)
        assets.extend(project_assets)
        vulns.extend(generate_vulnerabilities(project, project_assets, vuln_ids))
        scans.extend(generate_scan_runs(project, domain, project_members, scan_ids, scan_task_ids))

    templates = [finding_row(finding, None, None, SEED_ADMIN_ID, vuln_ids, is_template=True)
                 for finding in random.sample(FINDINGS, k=6)]

    reports = generate_reports(projects, report_ids)
    runners = generate_runners(4, runner_ids)
    schedules = generate_command_schedules(projects, schedule_ids)
    comments = generate_comments(vulns, projects, users, comment_ids)
    notifications = generate_notifications(users, projects, notification_ids)
    webhooks = generate_webhooks(webhook_ids)
    audit = generate_audit_log(projects, vulns, users, num_projects * 5, audit_ids)

    # Strip the helper keys used during generation, so only entity fields are emitted.
    for project in projects:
        for key in [k for k in project if k.startswith("_")]:
            del project[key]

    # Order matters: the importer saves each entity in turn, so parents come first.
    return {
        "users": users,
        "organisations": clients,
        "custom_fields": custom_fields,
        "projects": projects,
        "project_members": members,
        "tasks": tasks,
        "assets": assets,
        "vulnerabilities": vulns,
        "vulnerability_templates": templates,
        "comments": comments,
        "reports": reports,
        "runners": runners,
        "scan_runs": scans,
        "command_schedules": schedules,
        "notifications": notifications,
        "webhooks": webhooks,
        "audit_log": audit,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Reconmap demo data as importer-ready JSON.")
    parser.add_argument("projects", nargs="?", type=int, default=20, help="number of projects to generate")
    parser.add_argument("--seed", type=int, default=None, help="random seed for reproducible output")
    args = parser.parse_args()
    print(json.dumps(generate_demo_data(args.projects, args.seed), indent=2))
