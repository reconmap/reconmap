---
title: Configuring SMTP settings
parent: Admin manual
---

The SMTP settings can be found in the `config.json` file in the API backend directory. If the file does not exist, create one using [this file](https://github.com/Reconmap/api-backend/blob/master/config-template.json) as a template.

Edit the content of the file to show (adjusting the values accordingly):

```json
{
  "smtp": {
    "host": "just.another.smtp.server",
    "port": 587,
    "username": "smtpuser",
    "password": "smtpsecret",
    "fromEmail": "no-reply@reconmap.com",
    "fromName": "Reconmap"
  }
}
```
