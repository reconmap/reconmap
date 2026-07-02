INSERT INTO "user" (id, subject_id, first_name, last_name, username, email, role)
VALUES (0, 'NULL', 'System', '-', 'system','system@localhost', 'administrator');

INSERT INTO "user" (id, subject_id, first_name, last_name, username, email, role)
VALUES (1, 'fec17265-a0ae-4d5a-9e20-63487fc21b67', 'Administrator', '-', 'admin','admin@localhost', 'administrator');

INSERT INTO audit_log (created_by_uid, client_ip, action, object)
VALUES (0, '\x7f000001'::bytea, 'Initialised', 'System');

INSERT INTO vulnerability_category (id, parent_id, name, description)
VALUES (1, NULL, 'General', 'General categories.'),
       (2, 1, 'Access Controls', 'Related to authorization of users, and assessment of rights.'),
       (3, 1, 'Auditing and Logging', 'Related to auditing of actions, or logging of problems.'),
       (4, 1, 'Authentication', 'Related to the identification of users.'),
       (5, 1, 'Configuration', 'Related to security configurations of servers, devices, or software.'),
       (6, 1, 'Cryptography', 'Related to mathematical protections for data.'),
       (7, 1, 'Data Exposure', 'Related to unintended exposure of sensitive information.'),
       (8, 1, 'Data Validation', 'Related to improper reliance on the structure or values of data.'),
       (9, 1, 'Denial of Service', 'Related to causing system failure.'),
       (10, 1, 'Error Reporting', 'Related to the reporting of error conditions in a secure fashion.'),
       (11, 1, 'Patching', 'Related to keeping software up to date.'),
       (12, 1, 'Session Management', 'Related to the identification of authenticated users.'),
       (13, 1, 'Timing', 'Related to race conditions, locking, or order of operations.');

INSERT INTO organisation (created_by_uid, kind, name, url)
VALUES (1, 'service_provider', 'Reconmap', 'https://reconmap.com');

INSERT INTO contact (organisation_id, name, email)
VALUES (currval(pg_get_serial_sequence('organisation', 'id')), 'Contributors', 'no-reply@reconmap.com');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, 1, TRUE, 'Report template (Word)', 'Default report template in Word format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype, file_hash)
VALUES ('report', currval(pg_get_serial_sequence('report', 'id')), 1, 'default-report-template.docx', 'default-report-template.docx', 0, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, 1, TRUE, 'Report template (MD)', 'Default report template in Markdown format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype, file_hash)
VALUES ('report', currval(pg_get_serial_sequence('report', 'id')), 1, 'default-report-template.md', 'default-report-template.md', 0, 'text/markdown', '');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, 1, TRUE, 'Report template (Typst)', 'Default report template in Typst format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype, file_hash)
VALUES ('report', currval(pg_get_serial_sequence('report', 'id')), 1, 'default-report-template.typ', 'default-report-template.typ', 0, 'text/typst', '');

INSERT INTO project_category (name, description)
VALUES ('Managed security monitoring',
        'Includes the day-to-day monitoring and investigation of system events throughout the network as well as security events, such as user permission changes and user logins.'),
       ('Vulnerability risk assessment',
        'Determines the state of the organization''s existing security readiness, and provides insights into potential vulnerabilities for minimizing exposure.'),
       ('Compliance monitoring',
        'Involves checking how well the organization complies with data security policies and procedures. The MSSP typically performs ongoing scans of security devices and infrastructure to determine if any changes need to be made to boost compliance. And with the compliance landscape becoming more complex all the time, this service is especially valuable to organizations that need to comply with GDPR, CCPA, HIPAA, PCI DSS, and others.'),
       ('Threat intelligence',
        'Involves gathering information to help the organization determine which threats have, will, or are currently targeting the organization and its employees, as well as which of these threats represent a viable risk.'),
       ('Security consultation',
        'for several domains including executing a detailed assessment of the network to identify potential and real-world vulnerabilities, finding security lacunae, and providing recommendations on how to fix them.'),
       ('Security program development',
        'Includes policy development for helping to protect the organization\’s infrastructure, systems, network, and devices.'),
       ('Perimeter management',
        'Protects the defenses around the network from external attackers as well as from bad insiders.Relevant activities including establishing the controls and processes that limit access to sensitive data in the network and on the end point.'),
       ('Penetration testing',
        'Also known as pentesting, which entails simulating a cyberattack against the organization\’s information and technology assets to check for exploitable vulnerabilities. This service constitutes a form of ethical hacking that can be very effective at uncovering the vulnerabilities that may be successfully targeted by hackers ');

INSERT INTO project (created_by_uid, name, description, engagement_end_date)
VALUES (1, 'Onboarding to Reconmap', 'Project to ensure all Reconmap''s onboarding tasks are done in order.', CURRENT_DATE);

INSERT INTO task (created_by_uid, assigned_to_uid, project_id, summary, description, priority)
VALUES (1, 1, 1, '1. Update your organisation details', '[Follow this link](/settings/organisation)', 'medium'),
       (1, 1, 1, '2. Update your preferences', '[Follow this link](/users/preferences)', 'medium'),
       (1, 1, 1, '3. Invite your team', '[Follow this link](/users/create)', 'medium'),
       (1, 1, 1, '4. Create client', '[Follow this link](/clients/create)', 'medium'),
       (1, 1, 1, '5. Create project', '[Follow this link](/projects/create)', 'medium'),
       (1, 1, 1, '6. Archive the onboarding project', NULL, 'medium');

-- Default settings rows
INSERT INTO mail_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO ai_settings (id, provider, max_output_tokens, ollama_base_url, ollama_model) VALUES (1, 'Ollama', 4000, 'http://localhost:11434/', 'llama3.2') ON CONFLICT (id) DO NOTHING;

-- Reset sequences to prevent conflicts due to explicit ID insertions
SELECT setval(pg_get_serial_sequence('user', 'id'), COALESCE(MAX(id), 1)) FROM "user";
SELECT setval(pg_get_serial_sequence('vulnerability_category', 'id'), COALESCE(MAX(id), 1)) FROM vulnerability_category;
