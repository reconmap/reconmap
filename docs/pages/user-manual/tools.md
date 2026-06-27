---
title: Tools
parent: User manual
has_children: true
---

Reconmap includes a set of tools to help pentesters and security engineers in their daily work.

## Vault

The **vault** allows you to securely store credentials (passwords, API keys, etc.) related to your projects. You can access it by navigating to a specific **Project** details page and opening the **Vault** tab.

![Vault](/images/screenshots/vault.png)

From the project vault you can:

- Store new credentials for the project.
- Search for credentials.
- Encrypt and decrypt secrets securely.

## Password Generator

The **password generator** helps you create strong, unique passwords with different configurations. 

Rather than a standalone page, it is integrated directly into the **Vault** secret forms. When adding or editing a secret value, you can click the key generator icon next to the "Value" input. This opens a modal where you can customize the length and complexity of the generated passwords (including uppercase/lowercase characters, numbers, symbols, and avoiding ambiguous characters) and apply it directly to your secret value.
