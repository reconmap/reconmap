---
title: System settings
parent: System
grand_parent: User manual
---

The **system settings** view allows administrators to configure the Reconmap application.

## Mail Settings

The **mail settings** view allows you to configure the SMTP server used for sending emails (notifications, reports, etc.).

![Mail settings](/images/screenshots/mail-settings.png)

You can specify:

- SMTP server address and port.
- Authentication credentials (username and password).
- Encryption type (SSL/TLS).
- Sender name and email.

## AI Settings

The **AI settings** view allows you to configure the AI features in Reconmap, such as vulnerability summary and remediation advice generation.

![AI settings](/images/screenshots/ai-settings.png)

You can specify:

- **AI Provider**: Select between Ollama (for self-hosted local models), Azure OpenAI, OpenRouter, or AnonRouter.
- **Provider Settings**:
  - **Ollama**: Configure the Ollama base URL and Model name (e.g. `llama3.2`).
  - **Azure OpenAI**: Configure the endpoint URL, API key, and model deployment name.
  - **OpenRouter**: Configure the API key and preferred model name (e.g. `meta-llama/llama-3.1-70b-instruct`).
  - **AnonRouter**: Configure the API key and model name. Both are required; there is no default model. Enter the model identifier exactly as the provider lists it — identifiers are case-sensitive and may contain a `provider/model` prefix.
- **Max output tokens**: Control the maximum response length.

The provider selector and its fields are generated from the API's
`ai-providers.json` catalog. API keys are encrypted before storage and are
never returned to the browser; leaving a populated key field blank preserves
the stored value.

These AI features help you speed up the reporting process by automatically generating descriptions and advice for reported vulnerabilities.
