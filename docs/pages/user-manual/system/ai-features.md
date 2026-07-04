# AI Features

Reconmap integrates an AI assistant to automate repetitive analyst tasks and make the platform more agentic — capable of taking initiative without requiring constant human input.

## Configuring the AI provider

AI features are powered by whichever model you configure under **System → AI Settings**. The platform supports:

- **Ollama** (default) — run any compatible model locally; no data leaves your infrastructure
- **Azure OpenAI** — use a cloud-hosted deployment
- **OpenRouter** — access hundreds of models via a single API key

### Recommended: Ollama with a security-focused model

For the best results with pentesting workflows, use a model fine-tuned for cybersecurity tasks. Pull one via Ollama and set it as the model in AI Settings:

```bash
ollama pull hf.co/BugTraceAI/BugTraceAI-CORE-Fast
```

Then in **System → AI Settings**, set:

- **Provider**: `Ollama`
- **Base URL**: `http://localhost:11434/` (or your Ollama host)
- **Model**: `hf.co/BugTraceAI/BugTraceAI-CORE-Fast`

Any Ollama-compatible model works — this is just a recommended starting point for security-focused workloads.

---

## Agentic capabilities

### Automatic vulnerability triage (background)

When a scan completes and vulnerabilities are discovered, Reconmap automatically runs a triage assessment for each new finding. This happens in the background as part of scan result processing — no user action required.

The triage report covers:

- **Severity assessment** — confirms or adjusts the detected risk level with justification
- **Exploitability** — how easily the vulnerability could be exploited in the wild
- **Attack surface** — which systems or data are at risk
- **Immediate actions** — up to three specific next steps for the analyst
- **False positive check** — reasons the finding might not be a real issue

The result is stored with the vulnerability and visible on the **Triage** tab of the vulnerability details page.

### On-demand vulnerability triage

You can also request a fresh triage for any existing vulnerability from the **Triage** tab on the vulnerability details page. This is useful after updating the summary or description, or when you want a second opinion from a different model.

### Remediation generation

On the **Remediation** tab of a vulnerability, click **Generate remediation instructions with AI** to produce step-by-step fix guidance based on the vulnerability summary.

### Asset enrichment / next-step suggestions

On any asset details page, click **Suggest commands** to get a tactical plan including:

- Recommended tools for the asset type
- Exact runnable commands with the asset name substituted in
- Key indicators of compromise to look for

### Automatic parser output analysis

When using the **Generic LLM** output parser for a command, Reconmap passes the raw tool output to the AI to extract structured assets and vulnerabilities automatically. This allows any tool's output to be ingested without writing a custom parser.

---

## Privacy and data handling

When using Ollama, all inference happens on your own infrastructure — no data is sent to external services.

When using Azure OpenAI or OpenRouter, tool output, vulnerability descriptions, and asset names are sent to the configured third-party provider for inference. Ensure this complies with your organisation's data handling policies and the scope of work agreed with your client.
