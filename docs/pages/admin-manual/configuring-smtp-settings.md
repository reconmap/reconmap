---
title: Configuring SMTP settings
parent: Admin manual
---

The SMTP settings can be found in the `config.json` file in the API backend directory. If the file does not exist, create one using [this file](https://github.com/Reconmap/api-backend/blob/master/config-template.json) as a template.

Mail settings are now configured from the Dashboard instead of editing a backend config file by hand.

Go to `System -> Mail settings` and populate the SMTP section with:

- Host
- Port
- Username
- Password
- Sender email
- Sender name
- SSL/TLS toggle

The same page also stores IMAP settings for future mail-processing workflows.

The saved passwords are not returned back to the UI. When editing existing settings, leave a password field empty to keep the stored secret, or use the clear checkbox to remove it.

The report email delivery flow uses the SMTP configuration from this page. If SMTP host, port or sender email are missing, report delivery requests are rejected before they are queued.
