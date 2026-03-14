USE reconmap;

SET @admin_user_id = 1;

INSERT INTO user (id, subject_id, first_name, last_name, username, email, role)
VALUES (@admin_user_id, 'fec17265-a0ae-4d5a-9e20-63487fc21b67', 'Administrator', '-', 'admin','admin@localhost',
        'administrator');

INSERT INTO audit_log (created_by_uid, client_ip, action, object)
VALUES (NULL, INET6_ATON('127.0.0.1'), 'Initialised', 'System');

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
       (13, 1, 'Timing', 'Related to race conditions, locking, or order of operations.'),
       (14, NULL, 'OWASP WSTG - Information Gathering', ''),
       (15, 14, '4.01 - WSTG-INFO-01 (Conduct Search Engine Discovery and Reconnaissance for Information Leakage)', ''),
       (16, 14, '4.01 - WSTG-INFO-02 (Fingerprint Web Server)', ''),
       (17, 14, '4.01 - WSTG-INFO-03 (Review Webserver Metafiles for Information Leakage)', ''),
       (18, 14, '4.01 - WSTG-INFO-04 (Enumerate Applications on Webserver)', ''),
       (19, 14, '4.01 - WSTG-INFO-05 (Review Webpage Comments and Metadata for Information Leakage)', ''),
       (20, 14, '4.01 - WSTG-INFO-06 (Identify application entry points)', ''),
       (21, 14, '4.01 - WSTG-INFO-07 (Map execution paths through application)', ''),
       (22, 14, '4.01 - WSTG-INFO-08 (Fingerprint Web Application Framework)', ''),
       (23, 14, '4.01 - WSTG-INFO-09 (Fingerprint Web Application)', ''),
       (24, 14, '4.01 - WSTG-INFO-10 (Map Application Architecture )', ''),
       (25, NULL, 'OWASP WSTG - Configuration and Deploy Management Testing', ''),
       (26, 25, '4.02 - WSTG-CONF-01 (Test Network/Infrastructure Configuration)', ''),
       (27, 25, '4.02 - WSTG-CONF-02 (Test Application Platform Configuration)', ''),
       (28, 25, '4.02 - WSTG-CONF-03 (Test File Extensions Handling for Sensitive Information)', ''),
       (29, 25, '4.02 - WSTG-CONF-04 (Test Backup and Unreferenced Files for Sensitive Information)', ''),
       (30, 25, '4.02 - WSTG-CONF-05 (Enumerate Infrastructure and Application Admin Interfaces)', ''),
       (31, 25, '4.02 - WSTG-CONF-06 (Test HTTP Methods)', ''),
       (32, 25, '4.02 - WSTG-CONF-07 (Test HTTP Strict Transport Security)', ''),
       (33, 25, '4.02 - WSTG-CONF-08 (Test RIA cross domain policy)', ''),
       (34, 25, '4.02 - WSTG-CONF-09 (Test File Permission)', ''),
       (35, 25, '4.02 - WSTG-CONF-10 (Test for Subdomain Takeover)', ''),
       (36, 25, '4.02 - WSTG-CONF-11 (Test Cloud Storage)', ''),
       (37, NULL, 'OWASP WSTG - Identity Management Testing', ''),
       (38, 37, '4.03 - WSTG-IDNT-01 (Test Role Definitions)', ''),
       (39, 37, '4.03 - WSTG-IDNT-02 (Test User Registration Process)', ''),
       (40, 37, '4.03 - WSTG-IDNT-03 (Test Account Provisioning Process)', ''),
       (41, 37, '4.03 - WSTG-IDNT-04 (Testing for Account Enumeration and Guessable User Account)', ''),
       (42, 37, '4.03 - WSTG-IDNT-05 (Testing for Weak or unenforced username policy)', ''),
       (43, NULL, 'OWASP WSTG - Authentication Testing', ''),
       (44, 43, '4.04 - WSTG-ATHN-01 (Testing for Credentials Transported over an Encrypted Channel)', ''),
       (45, 43, '4.04 - WSTG-ATHN-02 (Testing for default credentials)', ''),
       (46, 43, '4.04 - WSTG-ATHN-03 (Testing for Weak lock out mechanism)', ''),
       (47, 43, '4.04 - WSTG-ATHN-04 (Testing for bypassing authentication schema)', ''),
       (48, 43, '4.04 - WSTG-ATHN-05 (Testing for Vulnerable remember password)', ''),
       (49, 43, '4.04 - WSTG-ATHN-06 (Testing for Browser cache weakness)', ''),
       (50, 43, '4.04 - WSTG-ATHN-07 (Testing for Weak password policy)', ''),
       (51, 43, '4.04 - WSTG-ATHN-08 (Testing for Weak security question/answer)', ''),
       (52, 43, '4.04 - WSTG-ATHN-09 (Testing for weak password change or reset functionalities)', ''),
       (53, 43, '4.04 - WSTG-ATHN-10 (Testing for Weaker authentication in alternative channel)', ''),
       (54, NULL, 'OWASP WSTG - Authorization Testing', ''),
       (55, 54, '4.05 - WSTG-ATHZ-01 (Testing Directory traversal/file include)', ''),
       (56, 54, '4.05 - WSTG-ATHZ-02 (Testing for bypassing authorization schema)', ''),
       (57, 54, '4.05 - WSTG-ATHZ-03 (Testing for Privilege Escalation)', ''),
       (58, 54, '4.05 - WSTG-ATHZ-04 (Testing for Insecure Direct Object References)', ''),
       (59, NULL, 'OWASP WSTG - Session Management Testing', ''),
       (60, 59, '4.06 - WSTG-SESS-01 (Testing for Bypassing Session Management Schema)', ''),
       (61, 59, '4.06 - WSTG-SESS-02 (Testing for Cookies attributes)', ''),
       (62, 59, '4.06 - WSTG-SESS-03 (Testing for Session Fixation)', ''),
       (63, 59, '4.06 - WSTG-SESS-04 (Testing for Exposed Session Variables)', ''),
       (64, 59, '4.06 - WSTG-SESS-05 (Testing for Cross Site Request Forgery)', ''),
       (65, 59, '4.06 - WSTG-SESS-06 (Testing for logout functionality)', ''),
       (66, 59, '4.06 - WSTG-SESS-07 (Testing Session Timeout)', ''),
       (67, 59, '4.06 - WSTG-SESS-08 (Testing for Session puzzling)', ''),
       (68, NULL, 'OWASP WSTG - Data Validation Testing', ''),
       (69, 68, '4.07 - WSTG-INPV-01 (Testing for Reflected Cross Site Scripting)', ''),
       (70, 68, '4.07 - WSTG-INPV-02 (Testing for Stored Cross Site Scripting)', ''),
       (71, 68, '4.07 - WSTG-INPV-03 (Testing for HTTP Verb Tampering)', ''),
       (72, 68, '4.07 - WSTG-INPV-04 (Testing for HTTP Parameter pollution)', ''),
       (73, 68, '4.07 - WSTG-INPV-05 (Testing for SQL Injection)', ''),
       (74, 68, '4.07 - WSTG-INPV-06 (Testing for LDAP Injection)', ''),
       (75, 68, '4.07 - WSTG-INPV-07 (Testing for XML Injection)', ''),
       (76, 68, '4.07 - WSTG-INPV-08 (Testing for SSI Injection)', ''),
       (77, 68, '4.07 - WSTG-INPV-09 (Testing for XPath Injection)', ''),
       (78, 68, '4.07 - WSTG-INPV-10 (Testing for IMAP SMTP Injection)', ''),
       (79, 68, '4.07 - WSTG-INPV-11 (Testing for Code Injection)', ''),
       (80, 68, '4.07 - WSTG-INPV-12 (Testing for Command Injection)', ''),
       (81, 68, '4.07 - WSTG-INPV-13 (Testing for Buffer overflow)', ''),
       (82, 68, '4.07 - WSTG-INPV-14 (Testing for incubated vulnerabilities)', ''),
       (83, 68, '4.07 - WSTG-INPV-15 (Testing for HTTP Splitting/Smuggling)', ''),
       (84, 68, '4.07 - WSTG-INPV-16 (Testing for HTTP Incoming Requests)', ''),
       (85, 68, '4.07 - WSTG-INPV-17 (Testing for Host Header Injection)', ''),
       (86, 68, '4.07 - WSTG-INPV-18 (Testing for Server Side Template Injection)', ''),
       (87, NULL, 'OWASP WSTG - Error Handling', ''),
       (88, 87, '4.08 - WSTG-ERRH-01 (Testing for Improper Error Handling)', ''),
       (89, 87, '4.08 - WSTG-ERRH-02 (Testing for Stack Traces)', ''),
       (90, NULL, 'OWASP WSTG - Cryptography', ''),
       (91, 90, '4.09 - WSTG-CRYP-01 (Testing for Weak SSL/TSL Ciphers, Insufficient Transport Layer Protection)', ''),
       (92, 90, '4.09 - WSTG-CRYP-02 (Testing for Padding Oracle)', ''),
       (93, 90, '4.09 - WSTG-CRYP-03 (Testing for Sensitive information sent via unencrypted channels)', ''),
       (94, 90, '4.09 - WSTG-CRYP-04 (Testing for Weak Encryption)', ''),
       (95, NULL, 'OWASP WSTG - Business Logic Testing', ''),
       (96, 95, '4.10 - WSTG-BUSL-01 (Test Business Logic Data Validation)', ''),
       (97, 95, '4.10 - WSTG-BUSL-02 (Test Ability to Forge Requests)', ''),
       (98, 95, '4.10 - WSTG-BUSL-03 (Test Integrity Checks)', ''),
       (99, 95, '4.10 - WSTG-BUSL-04 (Test for Process Timing)', ''),
       (100, 95, '4.10 - WSTG-BUSL-05 (Test Number of Times a Function Can be Used Limits)', ''),
       (101, 95, '4.10 - WSTG-BUSL-06 (Testing for the Circumvention of Work Flows)', ''),
       (102, 95, '4.10 - WSTG-BUSL-07 (Test Defenses Against Application Mis-use)', ''),
       (103, 95, '4.10 - WSTG-BUSL-08 (Test Upload of Unexpected File Types)', ''),
       (104, 95, '4.10 - WSTG-BUSL-09 (Test Upload of Malicious Files)', ''),
       (105, NULL, 'OWASP WSTG - Client Side Testing', ''),
       (106, 105, '4.11 - WSTG-CLNT-01 (Testing for DOM based Cross Site Scripting)', ''),
       (107, 105, '4.11 - WSTG-CLNT-02 (Testing for JavaScript Execution)', ''),
       (108, 105, '4.11 - WSTG-CLNT-03 (Testing for HTML Injection)', ''),
       (109, 105, '4.11 - WSTG-CLNT-04 (Testing for Client Side URL Redirect)', ''),
       (110, 105, '4.11 - WSTG-CLNT-05 (Testing for CSS Injection)', ''),
       (111, 105, '4.11 - WSTG-CLNT-06 (Testing for Client Side Resource Manipulation)', ''),
       (112, 105, '4.11 - WSTG-CLNT-07 (Testing Cross Origin Resource Sharing)', ''),
       (113, 105, '4.11 - WSTG-CLNT-08 (Testing for Cross Site Flashing)', ''),
       (114, 105, '4.11 - WSTG-CLNT-09 (Testing for Clickjacking)', ''),
       (115, 105, '4.11 - WSTG-CLNT-10 (Testing WebSockets)', ''),
       (116, 105, '4.11 - WSTG-CLNT-11 (Testing Web Messaging)', ''),
       (117, 105, '4.11 - WSTG-CLNT-12 (Testing Browser Storage)', ''),
       (118, 105, '4.11 - WSTG-CLNT-13 (Testing for Cross Site Script Inclusion)', '');

INSERT INTO organisation (created_by_uid, kind, name, url)
VALUES (@admin_user_id, 'service_provider', 'Reconmap', 'https://reconmap.com');

INSERT INTO contact (organisation_id, name, email)
VALUES (LAST_INSERT_ID(), 'Contributors', 'no-reply@reconmap.com');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, @admin_user_id, TRUE, 'Report template (HTML)', 'Default report template in HTML format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype,
                        file_hash)
VALUES ('report', LAST_INSERT_ID(), @admin_user_id, 'default-report-template.html', 'default-report-template.html', 0,
        'text/html', '');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, @admin_user_id, TRUE, 'Report template (Word)', 'Default report template in Word format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype,
                        file_hash)
VALUES ('report', LAST_INSERT_ID(), @admin_user_id, 'default-report-template.docx', 'default-report-template.docx', 0,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, @admin_user_id, TRUE, 'Report template (MD)', 'Default report template in Markdown format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype,
                        file_hash)
VALUES ('report', LAST_INSERT_ID(), @admin_user_id, 'default-report-template.md', 'default-report-template.md', 0,
        'text/markdown', '');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, @admin_user_id, TRUE, 'Report template (TXT)', 'Default report template in Text format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype,
                        file_hash)
VALUES ('report', LAST_INSERT_ID(), @admin_user_id, 'default-report-template.txt', 'default-report-template.txt', 0,
        'text/plain', '');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, @admin_user_id, TRUE, 'Report template (TEX)', 'Default report template in LaTeX format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype,
                        file_hash)
VALUES ('report', LAST_INSERT_ID(), @admin_user_id, 'default-report-template.tex', 'default-report-template.tex', 0,
        'application/x-tex', '');

INSERT INTO report (project_id, created_by_uid, is_template, version_name, version_description)
VALUES (NULL, @admin_user_id, TRUE, 'Report template (Typst)', 'Default report template in Typst format');

INSERT INTO attachment (parent_type, parent_id, created_by_uid, client_file_name, file_name, file_size, file_mimetype,
        file_hash)
VALUES ('report', LAST_INSERT_ID(), @admin_user_id, 'default-report-template.typ', 'default-report-template.typ', 0,
        'text/typst', '');

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
        'Includes policy development for helping to protect the organization’s infrastructure, systems, network, and devices.'),
       ('Perimeter management',
        'Protects the defenses around the network from external attackers as well as from bad insiders.Relevant activities including establishing the controls and processes that limit access to sensitive data in the network and on the end point.'),
       ('Penetration testing',
        'Also known as pentesting, which entails simulating a cyberattack against the organization’s information and technology assets to check for exploitable vulnerabilities. This service constitutes a form of ethical hacking that can be very effective at uncovering the vulnerabilities that may be successfully targeted by hackers ');

INSERT INTO project (created_by_uid, name, description, engagement_end_date)
VALUES (@admin_user_id, 'Onboarding to Reconmap',
        'Project to ensure all Reconmap\'s onboarding tasks are done in order.',
        CURRENT_DATE);

INSERT INTO task (created_by_uid, assigned_to_uid, project_id, summary, description, priority)
VALUES (1, 1, 1, '1. Update your organisation details', '[Follow this link](/settings/organisation)', 'medium'),
       (1, 1, 1, '2. Update your preferences', '[Follow this link](/users/preferences)', 'medium'),
       (1, 1, 1, '3. Invite your team', '[Follow this link](/users/create)', 'medium'),
       (1, 1, 1, '4. Create client', '[Follow this link](/clients/create)', 'medium'),
       (1, 1, 1, '5. Create project', '[Follow this link](/projects/create)', 'medium'),
       (1, 1, 1, '6. Archive the onboarding project', NULL, 'medium');

