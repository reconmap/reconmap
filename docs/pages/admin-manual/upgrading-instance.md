---
title: Upgrading a Reconmap instance
parent: Admin manual
---

### Incremental upgrade

This is the upgrade path on instances where you have data and you want to preserve it (99% of the cases).

Run the following commands on the directory where you have your `docker-compose.yml`.

```shell
docker-compose pull # Download latest version of the docker images
docker-compose down # Stop and remove any containers
docker-compose up -d # Build containers and start them
```

#### Scan runs tables

The scan history feature stores scans in the `scan_run` and `scan_run_task` tables and links scheduled commands to them through a new `command_schedule.scan_run_task_id` column. The database initialisation script only runs on an empty database, so existing installations must apply this once:

```sql
ALTER TABLE command_schedule ADD COLUMN scan_run_task_id INT NULL;

CREATE TABLE scan_run
(
    id              SERIAL PRIMARY KEY,
    project_id      INT           NOT NULL,
    created_by_id  INT           NOT NULL,
    target          VARCHAR(500)  NOT NULL,
    target_type     VARCHAR(30)   NOT NULL,
    objective       VARCHAR(100)  NOT NULL,
    strategy        TEXT          NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'queued',
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ   NULL,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

CREATE TABLE scan_run_task
(
    id               SERIAL PRIMARY KEY,
    scan_run_id      INT           NOT NULL,
    position         INT           NOT NULL,
    command_id       VARCHAR(100)  NOT NULL,
    command_name     VARCHAR(200)  NOT NULL,
    command_usage_id VARCHAR(100)  NOT NULL,
    executable_path  VARCHAR(500)  NULL,
    arguments        VARCHAR(1000) NULL,
    rationale        TEXT          NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'queued',
    error            TEXT          NULL,
    started_at       TIMESTAMPTZ   NULL,
    finished_at      TIMESTAMPTZ   NULL,
    FOREIGN KEY (scan_run_id) REFERENCES scan_run(id) ON DELETE CASCADE
);

CREATE TRIGGER update_scan_run_updated_at BEFORE UPDATE ON scan_run FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Runners must be upgraded together with the API: older runners do not report scan progress or upload command output.

#### User foreign key columns renamed to `_id`

The `*_uid` user foreign key columns are now named `*_id`. The database initialisation script only runs on an empty database, so existing installations must rename them once before starting the new version. If you already created the `scan_run` table from an earlier version of the scan runs SQL above, also run `ALTER TABLE scan_run RENAME COLUMN created_by_uid TO created_by_id;`.

```sql
ALTER TABLE attachment RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE organisation RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE project RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE audit_log RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE vault RENAME COLUMN owner_uid TO owner_id;
ALTER TABLE vulnerability RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE task RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE task RENAME COLUMN assigned_to_uid TO assigned_to_id;
ALTER TABLE command_schedule RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE report RENAME COLUMN created_by_uid TO created_by_id;
ALTER TABLE note RENAME COLUMN created_by_uid TO created_by_id;
```

### Destructive upgrade

**CAUTION:** This method will destroy all existing data. Do not proceed with these instructions unless you don't mind losing everything that exists in the Reconmap database.

```shell
docker-compose pull # Download latest version of the docker images
docker-compose down -v # Stop and remove any containers and volumes
docker-compose up -d # Build containers and start them
```
