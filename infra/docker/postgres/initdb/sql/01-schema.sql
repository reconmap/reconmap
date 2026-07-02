DROP VIEW IF EXISTS vulnerability_template;
DROP VIEW IF EXISTS project_template;
DROP VIEW IF EXISTS user_info;
DROP TABLE IF EXISTS user_api_token CASCADE;
DROP TABLE IF EXISTS agent CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS note CASCADE;
DROP TABLE IF EXISTS document CASCADE;
DROP TABLE IF EXISTS ai_settings CASCADE;
DROP TABLE IF EXISTS mail_settings CASCADE;
DROP TABLE IF EXISTS custom_field CASCADE;
DROP TABLE IF EXISTS report CASCADE;
DROP TABLE IF EXISTS command_schedule CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS vulnerability CASCADE;
DROP TABLE IF EXISTS vulnerability_category CASCADE;
DROP TABLE IF EXISTS asset CASCADE;
DROP TABLE IF EXISTS project_user CASCADE;
DROP TABLE IF EXISTS vault CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS azure_devops_integration CASCADE;
DROP TABLE IF EXISTS jira_integration CASCADE;
DROP TABLE IF EXISTS webhook CASCADE;
DROP TABLE IF EXISTS contact CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS project_category CASCADE;
DROP TABLE IF EXISTS organisation CASCADE;
DROP TABLE IF EXISTS attachment CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- 1. user
CREATE TABLE "user"
(
    id            SERIAL PRIMARY KEY,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ   NULL,
    last_login_ts TIMESTAMPTZ   NULL,
    subject_id    VARCHAR(40)   NOT NULL,
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    email         VARCHAR(200)  NOT NULL,
    role          VARCHAR(20)   NULL,
    username      VARCHAR(80)   NOT NULL UNIQUE,
    first_name    VARCHAR(100)  NOT NULL,
    last_name     VARCHAR(100)  NOT NULL,
    full_name     VARCHAR(210) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    short_bio     VARCHAR(1000) NULL,
    timezone      VARCHAR(200)  NOT NULL DEFAULT 'UTC',
    mfa_enabled   BOOLEAN       NOT NULL DEFAULT FALSE,
    preferences   JSONB         NULL
);

-- 2. attachment
CREATE TABLE attachment
(
    id               SERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_uid    INT                                                                             NOT NULL,
    updated_at  TIMESTAMPTZ             NULL,
    parent_type      VARCHAR(20) NOT NULL,
    parent_id        INT                                                                             NOT NULL,
    client_file_name VARCHAR(200)                                                                             NOT NULL,
    file_name        VARCHAR(200)                                                                             NOT NULL,
    file_size        INT                                                                             NOT NULL,
    file_mimetype    VARCHAR(200)                                                                             NULL,
    file_hash        VARCHAR(128)                                                                           NOT NULL,
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION
);

-- 3. organisation
CREATE TABLE organisation
(
    id                       SERIAL PRIMARY KEY,
    created_at                TIMESTAMPTZ                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMPTZ                         NULL,
    created_by_uid INT                        NOT NULL,
    kind                     VARCHAR(20) NOT NULL,
    name                     VARCHAR(80)                         NOT NULL UNIQUE,
    address                  VARCHAR(400)                        NULL,
    url                      VARCHAR(255)                        NULL,
    logo_attachment_id       INT                        NULL,
    small_logo_attachment_id INT                        NULL,
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION,
    FOREIGN KEY (logo_attachment_id) REFERENCES attachment (id) ON DELETE SET NULL,
    FOREIGN KEY (small_logo_attachment_id) REFERENCES attachment (id) ON DELETE SET NULL
);

-- 4. project_category
CREATE TABLE project_category
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL UNIQUE,
    description VARCHAR(2000) NULL
);

-- 5. project
CREATE TABLE project
(
    id                    SERIAL PRIMARY KEY,
    created_at             TIMESTAMPTZ                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ                NULL,
    created_by_uid           INT                        NOT NULL,
    service_provider_id   INT                        NULL,
    client_id             INT                        NULL,
    category_id           INT                        NULL,
    is_template           BOOLEAN                    NOT NULL DEFAULT FALSE,
    visibility            VARCHAR(20) NOT NULL DEFAULT 'public',
    name                  VARCHAR(200)               NOT NULL UNIQUE,
    description           VARCHAR(2000)              NULL,
    engagement_start_date DATE,
    engagement_end_date   DATE,
    archived              BOOLEAN                    NOT NULL DEFAULT FALSE,
    archived_at            TIMESTAMPTZ                NULL,
    external_id           VARCHAR(40)                NULL,
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION,
    CONSTRAINT project_fk_client_id FOREIGN KEY (client_id) REFERENCES organisation (id) ON DELETE SET NULL,
    CONSTRAINT project_fk_category_id FOREIGN KEY (category_id) REFERENCES project_category (id) ON DELETE SET NULL
);

-- 6. contact
CREATE TABLE contact
(
    id    SERIAL PRIMARY KEY,
    organisation_id INT             NOT NULL,
    kind  VARCHAR(20) NOT NULL DEFAULT 'general',
    name  VARCHAR(200)                             NOT NULL,
    email VARCHAR(200)                             NOT NULL,
    phone VARCHAR(200)                             NULL,
    role  VARCHAR(200)                             NULL,
    FOREIGN KEY (organisation_id) REFERENCES organisation (id) ON DELETE CASCADE
);

-- 7. webhook
CREATE TABLE webhook
(
    id         SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ  NULL,
    name       VARCHAR(200) NOT NULL,
    url        VARCHAR(512) NOT NULL,
    secret     VARCHAR(100) NULL,
    is_enabled BOOLEAN      NOT NULL DEFAULT TRUE,
    events     VARCHAR(512) NOT NULL
);

-- 8. jira_integration
CREATE TABLE jira_integration
(
    id          SERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NULL,
    name        VARCHAR(200) NOT NULL,
    url         VARCHAR(512) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    api_token   VARCHAR(512) NOT NULL,
    project_key VARCHAR(50)  NOT NULL,
    is_enabled  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 9. azure_devops_integration
CREATE TABLE azure_devops_integration
(
    id          SERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NULL,
    name        VARCHAR(200) NOT NULL,
    url         VARCHAR(512) NOT NULL,
    project_name       VARCHAR(200) NOT NULL,
    personal_access_token   VARCHAR(512) NOT NULL,
    is_enabled  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 10. audit_log
CREATE TABLE audit_log
(
    id         SERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_uid INT NULL,
    user_agent VARCHAR(250) NULL,
    client_ip  BYTEA NOT NULL,
    action     VARCHAR(200) NOT NULL,
    object     VARCHAR(200) NOT NULL,
    context    JSONB         NULL,
    CONSTRAINT audit_log_fk_user_id FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE CASCADE
);

-- 11. vault
CREATE TABLE vault
(
    id              SERIAL PRIMARY KEY,
    created_at       TIMESTAMPTZ                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ                            NULL,
    owner_uid       INT                           NOT NULL,
    project_id      INT                           NULL,
    type            VARCHAR(20) NOT NULL,
    name            VARCHAR(200)                           NOT NULL,
    value           BYTEA                        NOT NULL,
    url             VARCHAR(300)                           NULL,
    expiration_date DATE                                   NULL,
    iv              BYTEA                             NOT NULL,
    tag             BYTEA                             NOT NULL,
    note            VARCHAR(1000)                          NULL,
    UNIQUE (project_id, name),
    FOREIGN KEY (owner_uid) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
);

-- 12. project_user
CREATE TABLE project_user
(
    id         SERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    project_id INT NOT NULL,
    user_id    INT NOT NULL,
    UNIQUE (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
);

-- 13. asset
CREATE TABLE asset
(
    id         SERIAL PRIMARY KEY,
    parent_id  INT NULL,
    project_id INT NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NULL,
    name       VARCHAR(200) NOT NULL,
    type       VARCHAR(20),
    tags       JSONB         NULL,
    UNIQUE (project_id, name),
    FOREIGN KEY (parent_id) REFERENCES asset (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
);

-- 14. vulnerability_category
CREATE TABLE vulnerability_category
(
    id          SERIAL PRIMARY KEY,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ   NULL,
    parent_id   INT  NULL,
    name        VARCHAR(200)  NOT NULL UNIQUE,
    description VARCHAR(2000) NULL,
    FOREIGN KEY (parent_id) REFERENCES vulnerability_category (id) ON DELETE CASCADE
);

-- 15. vulnerability
CREATE TABLE vulnerability
(
    id                     SERIAL PRIMARY KEY,
    created_at              TIMESTAMPTZ                                                                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ                                                                                        NULL,
    created_by_uid            INT                                                                                       NOT NULL,
    is_template            BOOLEAN                                                                                            NOT NULL DEFAULT FALSE,
    external_id            VARCHAR(50)                                                                                        NULL,
    project_id             INT                                                                                       NULL,
    asset_id              INT                                                                                       NULL,
    category_id            INT                                                                                       NULL,
    summary                VARCHAR(500)                                                                                       NOT NULL,
    description            TEXT                                                                                               NULL,
    external_refs          TEXT                                                                                               NULL,
    visibility             VARCHAR(20)                                                                         NOT NULL DEFAULT 'public',
    risk                   VARCHAR(20)                                                 NOT NULL,
    proof_of_concept       TEXT                                                                                               NULL,
    impact                 TEXT                                                                                               NULL,
    remediation            TEXT                                                                                               NULL,
    remediation_complexity VARCHAR(20)                                                          NULL,
    remediation_priority   VARCHAR(20)                                                                       NULL,
    cvss_vector          VARCHAR(150)                                                                                       NULL,
    cvss_score           DECIMAL(3, 1)                                                                                      NULL,
    status                 VARCHAR(20)                                                   NOT NULL DEFAULT 'open',
    substatus              VARCHAR(20) NULL     DEFAULT 'reported',
    tags                   JSONB                                                                                               NULL,
    custom_fields          JSONB                                                                                               NULL,
    UNIQUE (project_id, asset_id, summary),
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION,
    CONSTRAINT vulnerability_fk_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES asset (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES vulnerability_category (id) ON DELETE SET NULL
);

-- 16. task
CREATE TABLE task
(
    id                SERIAL PRIMARY KEY,
    project_id        INT                                        NOT NULL,
    created_by_uid       INT                                        NOT NULL,
    assigned_to_uid      INT                                        NULL,
    created_at         TIMESTAMPTZ                                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ                                         NULL,
    priority          VARCHAR(20) NOT NULL,
    summary           VARCHAR(200)                                        NOT NULL,
    description       VARCHAR(2000)                                       NULL,
    status            VARCHAR(20)                      NOT NULL DEFAULT 'todo',
    duration_estimate SMALLINT                                   NULL,
    due_date          DATE                                                NULL,
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION,
    FOREIGN KEY (assigned_to_uid) REFERENCES "user" (id) ON DELETE SET NULL
);

-- 17. command_schedule
CREATE TABLE command_schedule
(
    id              SERIAL PRIMARY KEY,
    created_by_uid     INT  NOT NULL,
    project_id INT DEFAULT NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ   NULL,
    command_id      VARCHAR(100)  NULL,
    command_usage_id      VARCHAR(100)  NULL,
    argument_values VARCHAR(1000) NULL,
    cron_expression VARCHAR(60)   NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL
);

-- 18. report
CREATE TABLE report
(
    id                  SERIAL PRIMARY KEY,
    project_id          INT NULL,
    created_by_uid    INT NOT NULL,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_template         BOOLEAN      NOT NULL DEFAULT FALSE,
    version_name        VARCHAR(50)  NOT NULL,
    version_description VARCHAR(300) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION
);

-- 19. custom_field
CREATE TABLE custom_field
(
    id          SERIAL PRIMARY KEY,
    created_at   TIMESTAMPTZ                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ                         NULL,
    parent_type VARCHAR(50)              NOT NULL,
    name        VARCHAR(100)                        NOT NULL,
    label       VARCHAR(100)                        NOT NULL,
    kind        VARCHAR(20) NOT NULL,
    config      JSONB                                NOT NULL,
    UNIQUE (parent_type, name)
);

-- 20. mail_settings
CREATE TABLE mail_settings
(
    id              INTEGER NOT NULL PRIMARY KEY,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ  NULL DEFAULT NULL,
    smtp_host       VARCHAR(255) NULL,
    smtp_port       INTEGER NULL,
    smtp_username   VARCHAR(255) NULL,
    smtp_password   TEXT NULL,
    smtp_from_email VARCHAR(255) NULL,
    smtp_from_name  VARCHAR(255) NULL,
    smtp_use_ssl    BOOLEAN      NOT NULL DEFAULT TRUE,
    imap_host       VARCHAR(255) NULL,
    imap_port       INTEGER NULL,
    imap_username   VARCHAR(255) NULL,
    imap_password   TEXT NULL,
    imap_use_ssl    BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 21. ai_settings
CREATE TABLE ai_settings
(
    id                     INTEGER NOT NULL PRIMARY KEY,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ  NULL DEFAULT NULL,
    provider               VARCHAR(50)  NOT NULL DEFAULT 'Ollama',
    max_output_tokens      INTEGER          NOT NULL DEFAULT 4000,
    ollama_base_url        VARCHAR(255) NULL,
    ollama_model           VARCHAR(255) NULL,
    azure_openai_endpoint  VARCHAR(255) NULL,
    azure_openai_api_key   TEXT         NULL,
    azure_openai_deployment VARCHAR(255) NULL,
    openrouter_api_key     TEXT         NULL,
    openrouter_model       VARCHAR(255) NULL
);

-- 22. document
CREATE TABLE document
(
    id          SERIAL PRIMARY KEY,
    created_at   TIMESTAMPTZ                                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ                                  NULL,
    created_by_uid     INT                                 NOT NULL,
    parent_type VARCHAR(20) NOT NULL,
    parent_id   INT                                 NULL,
    visibility  VARCHAR(20)                   NOT NULL DEFAULT 'private',
    title       VARCHAR(250)                                 NULL,
    content     TEXT                                         NOT NULL,
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION
);

-- 23. note
CREATE TABLE note
(
    id          SERIAL PRIMARY KEY,
    created_at   TIMESTAMPTZ                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_uid     INT                      NOT NULL,
    parent_type VARCHAR(20) NOT NULL,
    parent_id   INT                      NOT NULL,
    visibility  VARCHAR(20)        NOT NULL DEFAULT 'private',
    content     TEXT                              NOT NULL,
    FOREIGN KEY (created_by_uid) REFERENCES "user" (id) ON DELETE NO ACTION
);

-- 24. notification
CREATE TABLE notification
(
    id         SERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ             NULL,
    to_user_id INT            NOT NULL,
    title      VARCHAR(200)            NULL,
    content    VARCHAR(4000)           NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'unread',
    FOREIGN KEY (to_user_id) REFERENCES "user" (id) ON DELETE CASCADE
);

-- 25. agent
CREATE TABLE agent
(
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    client_id    VARCHAR(100) NOT NULL,
    last_boot_at TIMESTAMPTZ  NULL,
    last_ping_at TIMESTAMPTZ  NULL,
    active       BOOLEAN      NOT NULL DEFAULT FALSE,
    version      VARCHAR(100) NULL,
    hostname     VARCHAR(100) NULL,
    arch         VARCHAR(100) NULL,
    cpu          VARCHAR(100) NULL,
    memory       VARCHAR(100) NULL,
    os           VARCHAR(100) NULL,
    ip VARCHAR(100) NULL,
    listen_addr           VARCHAR(100) NULL
);

-- 26. user_api_token
CREATE TABLE user_api_token
(
    id          SERIAL PRIMARY KEY,
    user_id     INT               NOT NULL,
    created_at  TIMESTAMPTZ                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMPTZ                NOT NULL,
    name        VARCHAR(100)               NOT NULL,
    token       VARCHAR(128)               NOT NULL UNIQUE,
    scope       VARCHAR(20) NOT NULL DEFAULT 'full',
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
);

-- Views
CREATE VIEW user_info AS SELECT id, email, role, username, first_name, last_name, full_name, short_bio FROM "user";

CREATE VIEW project_template AS
SELECT id, created_at, updated_at, created_by_uid, name, description, category_id
FROM project
WHERE is_template = TRUE;

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
       cvss_vector,
       cvss_score,
       tags
FROM vulnerability
WHERE is_template = TRUE;

-- Functions
CREATE OR REPLACE FUNCTION PARENT_CHILD_NAME(
    parent_name VARCHAR(100),
    child_name VARCHAR(100)
)
RETURNS VARCHAR(202)
AS $$
BEGIN
    IF parent_name IS NULL THEN
        RETURN child_name;
    END IF;
    RETURN parent_name || ', ' || child_name;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION project_archived_at_func()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.archived = TRUE AND OLD.archived = FALSE THEN
        NEW.archived_at = CURRENT_TIMESTAMP;
    ELSIF NEW.archived = FALSE THEN
        NEW.archived_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER project_archived_at_trigger
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE FUNCTION project_archived_at_func();

CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON project FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_updated_at BEFORE UPDATE ON webhook FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jira_integration_updated_at BEFORE UPDATE ON jira_integration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_azure_devops_integration_updated_at BEFORE UPDATE ON azure_devops_integration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organisation_updated_at BEFORE UPDATE ON organisation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vault_updated_at BEFORE UPDATE ON vault FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_updated_at BEFORE UPDATE ON asset FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vulnerability_category_updated_at BEFORE UPDATE ON vulnerability_category FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vulnerability_updated_at BEFORE UPDATE ON vulnerability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON task FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_command_schedule_updated_at BEFORE UPDATE ON command_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_field_updated_at BEFORE UPDATE ON custom_field FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mail_settings_updated_at BEFORE UPDATE ON mail_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON ai_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_updated_at BEFORE UPDATE ON document FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attachment_updated_at BEFORE UPDATE ON attachment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_updated_at BEFORE UPDATE ON notification FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
