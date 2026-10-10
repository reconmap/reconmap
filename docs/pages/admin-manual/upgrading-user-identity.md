# Upgrading user identity storage

Keycloak is now the source of truth for user identity. The Reconmap `user` table keeps only what Reconmap owns: the row id, the Keycloak subject id, role, short bio and preferences.

The following fields moved to Keycloak and were removed from the `user` table:

| Column | Now stored in |
|---|---|
| `username`, `email`, `first_name`, `last_name` | Keycloak user |
| `active` | Keycloak `enabled` |
| `created_at` | Keycloak `createdTimestamp` |
| `updated_at` | Keycloak attribute `updatedAt`, set by Reconmap on every write |
| `timezone` | Keycloak attribute `timezone` |
| `mfa_enabled` | Keycloak credentials (read-only in Reconmap) |
| `last_login_ts` | Keycloak login events (retained for 90 days) |
| `preferences.dashboard.language` | Keycloak `locale` |

A fresh install needs no action. For an existing installation, follow the steps below.

## 1. Check every user has a Keycloak subject

Every row must point at an existing Keycloak user. Run this against the `reconmap` database:

```sql
SELECT id, subject_id FROM "user" WHERE subject_id IS NULL OR subject_id = '';
```

The `system` user (`subject_id = 'NULL'`) is expected and is fine.

## 2. Save the values Keycloak does not have yet

Keycloak does not receive `timezone` or the language automatically. Export them before the upgrade drops the columns:

```sql
SELECT subject_id,
       timezone,
       preferences->>'dashboard.language' AS language
FROM "user"
WHERE subject_id <> 'NULL';
```

For each user, set the Keycloak `timezone` attribute and `locale` to these values, for example with the Keycloak admin console or the admin REST API. Users with no language saved fall back to English.

## 3. Deploy the new API and apply the schema change

Stop the API, then run the script below against the `reconmap` database. Take a backup first.

```sql
BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "user" WHERE subject_id IS NULL OR subject_id = '') THEN
        RAISE EXCEPTION 'Every user needs a Keycloak subject_id before upgrading';
    END IF;
END $$;

DROP VIEW IF EXISTS user_info;
DROP TRIGGER IF EXISTS update_user_updated_at ON "user";

ALTER TABLE "user"
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS last_login_ts,
    DROP COLUMN IF EXISTS active,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS username,
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS last_name,
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS timezone,
    DROP COLUMN IF EXISTS mfa_enabled;

ALTER TABLE "user" ALTER COLUMN subject_id SET NOT NULL;
ALTER TABLE "user" ADD CONSTRAINT user_subject_id_key UNIQUE (subject_id);

CREATE VIEW user_info AS SELECT id, subject_id, role, short_bio FROM "user";

UPDATE "user"
SET preferences = preferences - 'dashboard.language'
WHERE preferences IS NOT NULL;

COMMIT;
```

Then start the new API.

## 4. Check the result

- Open **Users**. Names, emails and status should appear for every user.
- Sign in as a user, open your profile, select **Edit** and save the **Preferences** section. Timezone and language should persist in Keycloak. Only the user can change their preferences.
- Create a user and confirm it appears in both Keycloak and the Reconmap user list.
