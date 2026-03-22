USE reconmap;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS project_category;

CREATE TABLE project_category
(
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name        VARCHAR(200)  NOT NULL,
    description VARCHAR(2000) NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (name)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS project;

CREATE TABLE project
(
    id                    INT UNSIGNED               NOT NULL AUTO_INCREMENT,
    created_at             TIMESTAMP                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP                  NULL ON UPDATE CURRENT_TIMESTAMP,
    created_by_uid           INT UNSIGNED               NOT NULL,
    service_provider_id   INT UNSIGNED               NULL COMMENT 'Null when project is template',
    client_id             INT UNSIGNED               NULL COMMENT 'Null when project is template',
    category_id           INT UNSIGNED               NULL,
    is_template           BOOLEAN                    NOT NULL DEFAULT FALSE,
    visibility            ENUM ('public', 'private') NOT NULL DEFAULT 'public',
    name                  VARCHAR(200)               NOT NULL,
    description           VARCHAR(2000)              NULL,
    engagement_start_date DATE,
    engagement_end_date   DATE,
    archived              BOOLEAN                    NOT NULL DEFAULT FALSE,
    archived_at            TIMESTAMP                  NULL,
    external_id           VARCHAR(40)                NULL,
    vulnerability_metrics ENUM ('CVSS', 'OWASP_RR')  NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (name),
    KEY (is_template),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION,
    CONSTRAINT project_fk_client_id FOREIGN KEY (client_id) REFERENCES organisation (id) ON DELETE SET NULL,
    CONSTRAINT project_fk_category_id FOREIGN KEY (category_id) REFERENCES project_category (id) ON DELETE SET NULL
) ENGINE = InnoDB;

DROP TABLE IF EXISTS contact;

CREATE TABLE contact
(
    id    INT UNSIGNED                             NOT NULL AUTO_INCREMENT,
    organisation_id INT UNSIGNED             NOT NULL,
    kind  ENUM ('general', 'technical', 'billing') NOT NULL DEFAULT 'general',
    name  VARCHAR(200)                             NOT NULL,
    email VARCHAR(200)                             NOT NULL,
    phone VARCHAR(200)                             NULL,
    role  VARCHAR(200)                             NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (organisation_id) REFERENCES organisation (id) ON DELETE CASCADE
) ENGINE = InnoDB;

DROP TABLE IF EXISTS webhook;

CREATE TABLE webhook
(
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
    name       VARCHAR(200) NOT NULL,
    url        VARCHAR(512) NOT NULL,
    secret     VARCHAR(100) NULL,
    is_enabled BOOLEAN      NOT NULL DEFAULT TRUE,
    events     VARCHAR(512) NOT NULL,

    PRIMARY KEY (id)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS jira_integration;

CREATE TABLE jira_integration
(
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
    name        VARCHAR(200) NOT NULL,
    url         VARCHAR(512) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    api_token   VARCHAR(512) NOT NULL,
    project_key VARCHAR(50)  NOT NULL,
    is_enabled  BOOLEAN      NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS azure_devops_integration;

CREATE TABLE azure_devops_integration
(
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
    name        VARCHAR(200) NOT NULL,
    url         VARCHAR(512) NOT NULL,
    project_name       VARCHAR(200) NOT NULL,
    personal_access_token   VARCHAR(512) NOT NULL,
    is_enabled  BOOLEAN      NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS organisation;

CREATE TABLE organisation
(
    id                       INT UNSIGNED                        NOT NULL AUTO_INCREMENT,
    created_at                TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP                           NULL ON UPDATE CURRENT_TIMESTAMP,
    created_by_uid INT UNSIGNED                        NOT NULL,
    kind                     ENUM ('service_provider', 'client') NOT NULL,
    name                     VARCHAR(80)                         NOT NULL COMMENT 'eg Company name',
    address                  VARCHAR(400)                        NULL COMMENT 'eg 1 Hacker Way, Menlo Park, California',
    url                      VARCHAR(255)                        NULL,
    logo_attachment_id       INT UNSIGNED                        NULL,
    small_logo_attachment_id INT UNSIGNED                        NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (name),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION,
    FOREIGN KEY (logo_attachment_id) REFERENCES attachment (id) ON DELETE SET NULL,
    FOREIGN KEY (small_logo_attachment_id) REFERENCES attachment (id) ON DELETE SET NULL
) ENGINE = InnoDB;

DROP TABLE IF EXISTS user;

CREATE TABLE user
(
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NULL ON UPDATE CURRENT_TIMESTAMP,
    last_login_ts TIMESTAMP     NULL COMMENT 'Last login time',
    subject_id    VARCHAR(40)   NOT NULL COMMENT 'JWT sub',
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    email         VARCHAR(200)  NOT NULL,
    role          ENUM ('administrator', 'superuser', 'user', 'client'),
    username      VARCHAR(80)   NOT NULL,
    first_name    VARCHAR(100)  NOT NULL,
    last_name     VARCHAR(100)  NOT NULL,
    full_name     VARCHAR(210) AS (CONCAT(first_name, ' ', last_name)),
    short_bio     VARCHAR(1000) NULL,
    timezone      VARCHAR(200)  NOT NULL DEFAULT 'UTC',
    mfa_enabled   BOOLEAN       NOT NULL DEFAULT FALSE,
    preferences   JSON          NULL COMMENT 'Client side (eg UI) preferences',

    PRIMARY KEY (id),
    UNIQUE KEY (username)
) ENGINE = InnoDB;

DROP VIEW IF EXISTS user_info;

CREATE VIEW user_info AS SELECT id, email, role, username, first_name, last_name, full_name, short_bio FROM user;

DROP TABLE IF EXISTS audit_log;

CREATE TABLE audit_log
(
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_uid INT UNSIGNED NULL COMMENT 'The subject/actor. Null is system',
    user_agent VARCHAR(250) NULL,
    client_ip  VARBINARY(16) NOT NULL COMMENT "Client's IP",
    action     VARCHAR(200) NOT NULL,
    object     VARCHAR(200) NOT NULL COMMENT 'The entity',
    context    JSON         NULL,

    PRIMARY KEY (id),
    KEY (created_by_uid),
    CONSTRAINT audit_log_fk_user_id FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB;

DROP TABLE IF EXISTS vault;

CREATE TABLE vault
(
    id              INT UNSIGNED                           NOT NULL AUTO_INCREMENT,
    created_at       TIMESTAMP                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP                              NULL ON UPDATE CURRENT_TIMESTAMP,
    owner_uid       INT UNSIGNED                           NOT NULL,
    project_id      INT UNSIGNED                           NULL,
    type            ENUM ('password','note','token','key') NOT NULL,
    name            VARCHAR(200)                           NOT NULL,
    value           VARBINARY(4096)                        NOT NULL,
    url             VARCHAR(300)                           NULL,
    expiration_date DATE                                   NULL,
    iv              BINARY(12)                             NOT NULL,
    tag             BINARY(16)                             NOT NULL,
    note            VARCHAR(1000)                          NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (project_id, name),
    FOREIGN KEY (owner_uid) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) Engine = InnoDB;

DROP VIEW IF EXISTS project_template;

CREATE VIEW project_template
AS
SELECT id, created_at, updated_at, created_by_uid, name, description, category_id
FROM project
WHERE is_template = 1;

DROP TRIGGER IF EXISTS project_archived_at_trigger;

DELIMITER $$

CREATE TRIGGER project_archived_at_trigger
BEFORE UPDATE ON project
FOR EACH ROW
BEGIN
    -- Set archive timestamp only when transitioning to archived
    IF NEW.archived = 1 AND OLD.archived = 0 THEN
        SET NEW.archived_at = CURRENT_TIMESTAMP;
    -- Clear timestamp only when unarchiving
    ELSEIF NEW.archived = 0 THEN
        SET NEW.archived_at = NULL;
    END IF;
END$$

DELIMITER ;

DROP TABLE IF EXISTS project_user;

CREATE TABLE project_user
(
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    project_id INT UNSIGNED NOT NULL,
    user_id    INT UNSIGNED NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS target;

CREATE TABLE target
(
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    parent_id  INT UNSIGNED NULL,
    project_id INT UNSIGNED NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
    name       VARCHAR(200) NOT NULL,
    kind       ENUM ('hostname', 'ip_address', 'port', 'cidr_range', 'url', 'binary', 'path', 'file'),
    tags       JSON         NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (project_id, name),
    FOREIGN KEY (parent_id) REFERENCES target (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) ENGINE = InnoDB;

DROP TABLE IF EXISTS vulnerability_category;

CREATE TABLE vulnerability_category
(
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     NULL ON UPDATE CURRENT_TIMESTAMP,
    parent_id   INT UNSIGNED  NULL,
    name        VARCHAR(200)  NOT NULL,
    description VARCHAR(2000) NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (name),
    KEY (parent_id),
    FOREIGN KEY (parent_id) REFERENCES vulnerability_category (id) ON DELETE CASCADE
) ENGINE = InnoDB;

DROP TABLE IF EXISTS vulnerability;

CREATE TABLE vulnerability
(
    id                     INT UNSIGNED                                                                                       NOT NULL AUTO_INCREMENT,
    created_at              TIMESTAMP                                                                                          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP                                                                                          NULL ON UPDATE CURRENT_TIMESTAMP,
    created_by_uid            INT UNSIGNED                                                                                       NOT NULL,

    is_template            BOOLEAN                                                                                            NOT NULL DEFAULT FALSE,

    external_id            VARCHAR(50)                                                                                        NULL COMMENT 'External reference eg RMAP-CLIENT-001',
    project_id             INT UNSIGNED                                                                                       NULL,
    target_id              INT UNSIGNED                                                                                       NULL,
    category_id            INT UNSIGNED                                                                                       NULL,

    summary                VARCHAR(500)                                                                                       NOT NULL,
    description            TEXT                                                                                               NULL,
    external_refs          TEXT                                                                                               NULL,

    visibility             ENUM ('private', 'public')                                                                         NOT NULL DEFAULT 'public',

    risk                   ENUM ('none', 'low', 'medium', 'high', 'critical')                                                 NOT NULL,
    proof_of_concept       TEXT                                                                                               NULL,
    impact                 TEXT                                                                                               NULL,
    remediation            TEXT                                                                                               NULL,
    remediation_complexity ENUM ('unknown', 'low', 'medium', 'high')                                                          NULL,
    remediation_priority   ENUM ('low','medium','high')                                                                       NULL,

    cvss_score             DECIMAL(3, 1)                                                                                      NULL,
    cvss_vector            VARCHAR(80)                                                                                        NULL,
    status                 ENUM ('open', 'confirmed', 'resolved', 'closed')                                                   NOT NULL DEFAULT 'open',
    substatus              ENUM ('reported', 'unresolved', 'unexploited', 'exploited', 'remediated', 'mitigated', 'rejected') NULL     DEFAULT 'reported',
    tags                   JSON                                                                                               NULL,
    owasp_vector           VARCHAR(80)                                                                                        NULL,
    owasp_likelihood         DECIMAL(5, 3)                                                                                      NULL,
    owasp_impact           DECIMAL(5, 3)                                                                                      NULL,
    owasp_overall          ENUM ('critical','high','medium','low','note')                                                     NULL,
    custom_fields          JSON                                                                                               NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (project_id, target_id, summary),
    KEY (is_template),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION,
    CONSTRAINT vulnerability_fk_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES target (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES vulnerability_category (id) ON DELETE SET NULL
) ENGINE = InnoDB;

DROP VIEW IF EXISTS vulnerability_template;
CREATE VIEW vulnerability_template AS
SELECT id,
       created_by_uid,
       category_id,
       created_at,
       updated_at,
       summary,
       description,
       proof_of_concept,
       impact,
       remediation,
       risk,
       cvss_score,
       cvss_vector,
       tags,
       owasp_vector,
       owasp_likelihood,
       owasp_impact,
       owasp_overall
FROM vulnerability
WHERE is_template = 1;

DROP TABLE IF EXISTS task;

CREATE TABLE task
(
    id                INT UNSIGNED                                        NOT NULL AUTO_INCREMENT,
    project_id        INT UNSIGNED                                        NOT NULL,
    created_by_uid       INT UNSIGNED                                        NOT NULL,
    assigned_to_uid      INT UNSIGNED                                        NULL,
    created_at         TIMESTAMP                                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP                                           NULL ON UPDATE CURRENT_TIMESTAMP,
    priority          ENUM ('highest', 'high', 'medium', 'low', 'lowest') NOT NULL,
    summary           VARCHAR(200)                                        NOT NULL,
    description       VARCHAR(2000)                                       NULL,
    status            ENUM ('todo', 'doing', 'done')                      NOT NULL DEFAULT 'todo',
    duration_estimate SMALLINT UNSIGNED                                   NULL COMMENT 'Estimate in hours, days, weeks, ...',
    due_date          DATE                                                NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION,
    FOREIGN KEY (assigned_to_uid) REFERENCES user (id) ON DELETE SET NULL
) ENGINE = InnoDB;

DROP TABLE IF EXISTS command;

CREATE TABLE command
(
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    created_by_uid   INT UNSIGNED  NOT NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NULL ON UPDATE CURRENT_TIMESTAMP,
    name          VARCHAR(200)  NOT NULL,
    description   VARCHAR(2000) NULL,
    more_info_url VARCHAR(200)  NULL,
    tags          JSON          NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION
) ENGINE = InnoDB;

DROP TABLE IF EXISTS command_usage;

CREATE TABLE command_usage
(
    id                    INT UNSIGNED                    NOT NULL AUTO_INCREMENT,
    command_id            INT UNSIGNED                    NOT NULL,
    created_by_uid           INT UNSIGNED                    NOT NULL,
    created_at             TIMESTAMP                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP                       NULL ON UPDATE CURRENT_TIMESTAMP,
    description           VARCHAR(2000)                   NULL,
    executable_path       VARCHAR(255)                    NULL,
    docker_image          VARCHAR(300)                    NULL,
    arguments             VARCHAR(2000)                   NULL,
    output_capturing_mode ENUM ('none', 'stdout', 'file') NOT NULL DEFAULT 'none',
    output_filename       VARCHAR(100)                    NULL,
    output_parser         VARCHAR(100)                    NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION,
    FOREIGN KEY (command_id) REFERENCES command (id) ON DELETE CASCADE
) ENGINE = InnoDB;

INSERT INTO command(id, created_by_uid, name)
VALUES (1, 1, 'nmap');

TRUNCATE TABLE command_usage;
INSERT INTO command_usage(id, created_by_uid, command_id, description, executable_path, arguments, output_capturing_mode,
                          output_parser)
VALUES (1, 1, 1, "Scan all reserved TCP ports on the machine.",
        "nmap",
        "-oX - {{{Host|||localhost}}}", "stdout", "nmap");

DROP TABLE IF EXISTS command_schedule;

CREATE TABLE command_schedule
(
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    created_by_uid     INT UNSIGNED  NOT NULL,
    project_id INT UNSIGNED DEFAULT NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NULL ON UPDATE CURRENT_TIMESTAMP,
    command_id      INT UNSIGNED  NULL,
    command_usage_id      INT UNSIGNED  NULL,
    argument_values VARCHAR(1000) NULL,
    cron_expression VARCHAR(60)   NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (command_id) REFERENCES command (id) ON DELETE CASCADE,
    FOREIGN KEY (command_usage_id) REFERENCES command_usage (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL
) ENGINE = InnoDB;

DROP TABLE IF EXISTS report;

CREATE TABLE report
(
    id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id          INT UNSIGNED NULL COMMENT 'Templates have project id NULL',
    created_by_uid    INT UNSIGNED NOT NULL,
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    is_template         BOOLEAN      NOT NULL DEFAULT FALSE,

    version_name        VARCHAR(50)  NOT NULL COMMENT 'eg 1.0, 202103',
    version_description VARCHAR(300) NOT NULL COMMENT 'eg Initial, Reviewed, In progress, Draft, Final',

    PRIMARY KEY (id),
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION,
    KEY (is_template)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS custom_field;

CREATE TABLE custom_field
(
    id          INT UNSIGNED                        NOT NULL AUTO_INCREMENT,
    created_at   TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP                           NULL ON UPDATE CURRENT_TIMESTAMP,
    parent_type ENUM ('vulnerability')              NOT NULL,
    name        VARCHAR(100)                        NOT NULL,
    label       VARCHAR(100)                        NOT NULL,
    kind        ENUM ('text', 'integer', 'decimal') NOT NULL,
    config      JSON                                NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY (parent_type, name)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS mail_settings;

CREATE TABLE mail_settings
(
    id              INT UNSIGNED NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    smtp_host       VARCHAR(255) NULL,
    smtp_port       INT NULL,
    smtp_username   VARCHAR(255) NULL,
    smtp_password   TEXT NULL,
    smtp_from_email VARCHAR(255) NULL,
    smtp_from_name  VARCHAR(255) NULL,
    smtp_use_ssl    BOOLEAN      NOT NULL DEFAULT TRUE,
    imap_host       VARCHAR(255) NULL,
    imap_port       INT NULL,
    imap_username   VARCHAR(255) NULL,
    imap_password   TEXT NULL,
    imap_use_ssl    BOOLEAN      NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS ai_settings;

CREATE TABLE ai_settings
(
    id                     INT UNSIGNED NOT NULL,
    created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    provider               VARCHAR(50)  NOT NULL DEFAULT 'Ollama',
    max_output_tokens      INT          NOT NULL DEFAULT 4000,
    ollama_base_url        VARCHAR(255) NULL,
    ollama_model           VARCHAR(255) NULL,
    azure_openai_endpoint  VARCHAR(255) NULL,
    azure_openai_api_key   TEXT         NULL,
    azure_openai_deployment VARCHAR(255) NULL,
    openrouter_api_key     TEXT         NULL,
    openrouter_model       VARCHAR(255) NULL,

    PRIMARY KEY (id)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS document;

CREATE TABLE document
(
    id          INT UNSIGNED                                 NOT NULL AUTO_INCREMENT,
    created_at   TIMESTAMP                                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP                                    NULL ON UPDATE CURRENT_TIMESTAMP,
    created_by_uid     INT UNSIGNED                                 NOT NULL,
    parent_type ENUM ('library', 'project', 'vulnerability') NOT NULL,
    parent_id   INT UNSIGNED                                 NULL,
    visibility  ENUM ('private', 'public')                   NOT NULL DEFAULT 'private',
    title       VARCHAR(250)                                 NULL,
    content     TEXT                                         NOT NULL,

    PRIMARY KEY (id),
    INDEX (parent_type, parent_id),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION
) ENGINE = InnoDB;

DROP TABLE IF EXISTS note;

CREATE TABLE note
(
    id          INT UNSIGNED                      NOT NULL AUTO_INCREMENT,
    created_at   TIMESTAMP                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_by_uid     INT UNSIGNED                      NOT NULL,
    parent_type ENUM ('project', 'vulnerability') NOT NULL,
    parent_id   INT UNSIGNED                      NOT NULL,
    visibility  ENUM ('private', 'public')        NOT NULL DEFAULT 'private',
    content     TEXT                              NOT NULL,

    PRIMARY KEY (id),
    INDEX (parent_type, parent_id),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION
) ENGINE = InnoDB;

DROP TABLE IF EXISTS attachment;

CREATE TABLE attachment
(
    id               INT UNSIGNED                                                                             NOT NULL AUTO_INCREMENT,
    created_at  TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_uid    INT UNSIGNED                                                                             NOT NULL,
    updated_at  TIMESTAMP               NULL ON UPDATE CURRENT_TIMESTAMP,
    parent_type      ENUM ('project', 'report', 'command', 'task', 'vulnerability', 'organisation', 'client') NOT NULL,
    parent_id        INT UNSIGNED                                                                             NOT NULL,
    client_file_name VARCHAR(200)                                                                             NOT NULL,
    file_name        VARCHAR(200)                                                                             NOT NULL,
    file_size        INT UNSIGNED                                                                             NOT NULL,
    file_mimetype    VARCHAR(200)                                                                             NULL,
    file_hash        VARCHAR(128)                                                                           NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (created_by_uid) REFERENCES user (id) ON DELETE NO ACTION
) ENGINE = InnoDB;

DROP FUNCTION IF EXISTS PARENT_CHILD_NAME;

DELIMITER $$

CREATE FUNCTION PARENT_CHILD_NAME(
    parent_name VARCHAR(100),
    child_name VARCHAR(100)
)
    RETURNS VARCHAR(202)
    DETERMINISTIC
BEGIN
    IF
        parent_name IS NULL THEN
        RETURN child_name;
    END IF;
    RETURN CONCAT(parent_name, ', ', child_name);
END$$

DELIMITER ;

DROP TABLE IF EXISTS notification;

CREATE TABLE notification
(
    id         INT UNSIGNED            NOT NULL AUTO_INCREMENT,
    created_at  TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP               NULL ON UPDATE CURRENT_TIMESTAMP,
    to_user_id INT UNSIGNED            NOT NULL,
    title      VARCHAR(200)            NULL,
    content    VARCHAR(4000)           NOT NULL,
    status     ENUM ('unread', 'read') NOT NULL DEFAULT 'unread',

    PRIMARY KEY (id),
    FOREIGN KEY (to_user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB;

DROP TABLE IF EXISTS agent;

CREATE TABLE agent
(
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    client_id    VARCHAR(100) NOT NULL,
    last_boot_at TIMESTAMP    NULL,
    last_ping_at TIMESTAMP    NULL,
    active       BOOLEAN      NOT NULL DEFAULT FALSE,
    version      VARCHAR(100) NULL,
    hostname     VARCHAR(100) NULL,
    arch         VARCHAR(100) NULL,
    cpu          VARCHAR(100) NULL,
    memory       VARCHAR(100) NULL,
    os           VARCHAR(100) NULL,
    ip VARCHAR(100) NULL,
    listen_addr           VARCHAR(100) NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB;

DROP TABLE IF EXISTS user_api_token;

CREATE TABLE user_api_token
(
    id          INT UNSIGNED               NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED               NOT NULL,
    created_at  TIMESTAMP                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP                  NOT NULL,
    name        VARCHAR(100)               NOT NULL,
    token       VARCHAR(128)               NOT NULL,
    scope       ENUM ('full', 'read-only') NOT NULL DEFAULT 'full',

    PRIMARY KEY (id),
    UNIQUE KEY (token),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB;

SET
    FOREIGN_KEY_CHECKS = 1;
