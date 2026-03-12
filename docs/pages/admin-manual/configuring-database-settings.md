---
title: Configuring database settings
parent: Admin manual
---

The database settings can be found in the `config.json` file in the API backend directory. If the file does not exist, create one using [this file](https://github.com/Reconmap/api-backend/blob/master/config-template.json) as a template.

Edit the content of the file to show (adjusting the values accordingly):

```json
{
  "database": {
    "host": "rmap-mysql",
    "username": "reconmapper",
    "password": "reconmapped",
    "name": "reconmap"
  }
}
```
