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

- **AI Provider**: Select between Ollama (for self-hosted local models), Azure OpenAI, OpenRouter, AnonRouter, or OrcaRouter Cyber Inference.
- **Provider Settings**:
  - **Ollama**: Configure the Ollama base URL and Model name (e.g. `llama3.2`).
  - **Azure OpenAI**: Configure the endpoint URL, API key, and model deployment name.
  - **OpenRouter**: Configure the API key and preferred model name (e.g. `meta-llama/llama-3.1-70b-instruct`).
  - **AnonRouter**: Configure the API key and model name. Both are required; there is no default model. Enter the model identifier exactly as the provider lists it — identifiers are case-sensitive and may contain a `provider/model` prefix.
  - **OrcaRouter Cyber Inference**: Paste an `sk-orca-…` API key, then choose a model from the dropdown. The list comes live from your OrcaRouter account (default `orcarouter/auto`; cyber models such as `orca/orcacyber-ultra-1.0` require a business-verified account). If the catalog is unreachable the page labels a verified fallback list instead, and a model that is no longer offered is cleared. See [AI features](ai-features.md#orcarouter-cyber-inference).
- **Max output tokens**: Control the maximum response length.

The provider selector and its fields are generated from the API's
`ai-providers.json` catalog. API keys are encrypted before storage and are
never returned to the browser; leaving a populated key field blank preserves
the stored value.

These AI features help you speed up the reporting process by automatically generating descriptions and advice for reported vulnerabilities.
