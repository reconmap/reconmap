---
title: Translations
parent: Development
---

Reconmap's user interface support multiple languages and more can be added with ease following the instructions below.

### Modifying translations

If you wish to modify the existing translations locate the [language folder and files here](https://github.com/reconmap/reconmap/tree/main/src/dashboard/src/translations) and make your modifications. If you want to contribute back please do so opening a PR (pull request) against the repository.

### Adding a new translation

Adding a translation is as simple as adding a new entry to [this array](https://github.com/reconmap/reconmap/blob/main/src/dashboard/src/translations/LanguageList.ts), replicating the [folder structure found here](https://github.com/reconmap/reconmap/tree/main/src/dashboard/src/translations) and registering the `application.json` and `common.json` files of the new language in [i18n.ts](https://github.com/reconmap/reconmap/blob/main/src/dashboard/src/translations/i18n.ts).

Languages are not stored in Keycloak's `supportedLocales` list automatically. If you add a language, add its locale code to `supportedLocales` in [infra/keycloak/realm.json](https://github.com/reconmap/reconmap/blob/main/infra/keycloak/realm.json) too, so the login pages offer it.

Only translate strings that the dashboard actually uses. A key that is not referenced by any `t()` call in the source is dead weight: remove it from every language file rather than translating it.
