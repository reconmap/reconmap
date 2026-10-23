# AI Features

Reconmap integrates an AI assistant to automate repetitive analyst tasks and make the platform more agentic — capable of taking initiative without requiring constant human input.

## Configuring the AI provider

AI features are powered by whichever model you configure under **System → AI Settings**. The platform supports:

- **Ollama** (default) — run any compatible model locally; no data leaves your infrastructure
- **Azure OpenAI** — use a cloud-hosted deployment
- **OpenRouter** — access hundreds of models via a single API key
- **AnonRouter** — an OpenAI-compatible router reached with a single API key; requires both an API key and a model identifier
- **OrcaRouter Cyber Inference** — an OpenAI-compatible gateway for authorised security work; the model list is discovered live from your account

### OrcaRouter Cyber Inference

[OrcaRouter](https://www.orcarouter.ai) is an OpenAI-compatible AI gateway that routes many providers
behind one endpoint. Its **Cyber Inference** provider is aimed at security teams that hold a business-verified
OrcaRouter account and run **authorised, scoped** security engagements — the kind of work general-purpose
gateways often refuse or silently downgrade.

- Provider page: <https://www.orcarouter.ai/cyber>
- Cyber model catalog: <https://www.orcarouter.ai/models?tier=cyber>

Configure it under **System → AI Settings**:

| Setting | Value |
| --- | --- |
| Provider | `OrcaRouter Cyber Inference` |
| API key | your `sk-orca-…` key from <https://www.orcarouter.ai/console> |
| Model | chosen from the live catalog (see below) |

Model choices, in order of preference:

1. **`orcarouter/auto`** (default) — automatic routing; works with any OrcaRouter key and needs no model decision.
2. **Cyber models for business-verified security teams** — `orca/orcacyber-ultra-1.0` (OrcaCyber Ultra,
   security code scanning and multi-step reasoning over large codebases) and `orca/orcacyber-zero-1.5`
   (OrcaCyber Zero, driven by the OrcaCyber harness). These unlock against accounts that have completed
   business verification, which is what lets OrcaRouter serve authorised red-team and blue-team workloads.
3. **`orcarouter/fusion`** — general-purpose fallback when a routing default is preferred.

Red teams use the cyber models for authorised offensive engagements; blue teams can point the same endpoint
at the gateway's controls and defences. Model availability is always governed by the account: the settings
page lists only what your key can actually use.

#### Live model discovery

The model control is a dropdown populated from OrcaRouter's catalog
(`GET https://api.orcarouter.ai/v1/models`) using the API key you saved. The key stays on the Reconmap API
server — the dashboard only receives model metadata. For each AI entry point the list is filtered by
capability, and models without a compatible endpoint type are excluded rather than shown as a guess.

If the catalog cannot be reached, the page says so and offers a small verified fallback list
(`orcarouter/auto`, `orcarouter/fusion`, `deepseek/deepseek-v4-pro`, `orca/orcacyber-ultra-1.0`,
`orca/orcacyber-zero-1.5`, `orca/orcacyber-zero-1.0`) containing models confirmed in the live catalog.
Live discovery always wins when it succeeds. A saved model that is no longer
offered by the catalog is cleared and must be re-selected before saving.

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

### Adding an OpenAI-compatible provider

Deployment maintainers can add another OpenAI-compatible model router without
changing the database, API DTOs, or dashboard. Add its definition to
`src/server/Api/ai-providers.json` with a unique ID, display name, the
`openai-compatible` adapter, an absolute API endpoint, and its form fields.
For example:

```json
{
  "Id": "ExampleRouter",
  "Name": "Example Router",
  "Adapter": "openai-compatible",
  "Endpoint": "https://router.example/api/v1",
  "Fields": [
    {
      "Key": "apiKey",
      "Label": "API key",
      "Type": "secret",
      "Required": true
    },
    {
      "Key": "model",
      "Label": "Model",
      "Type": "text",
      "Required": true
    }
  ]
}
```

Supported field types are `text`, `url`, `secret`, and `model`. Secret fields are
write-only in the settings API and encrypted at rest. A `model` field renders as a
dropdown populated from the provider's `GET <Endpoint>/models` endpoint instead of
free text; it requires a `Capability` (`chat`, `embedding`, `image`, `video` or
`rerank`) and should ship a small `VerifiedModels` list used only when live discovery
is unavailable. Provider and field IDs must remain stable because they identify
stored settings. Providers requiring a protocol other than Ollama, Azure OpenAI, or
an OpenAI-compatible API need a corresponding API adapter.

---

## Agentic capabilities

### AI Scan Planning & Tool Chaining

Reconmap automates scanning by analyzing target inputs (URL, domain, IP, hostname, code repository) and generating an optimal execution plan:

- **Target Analysis**: When entering a target on the **Run scan** page, the AI identifies the target type and scope.
- **Ordered Tool Recommendations**: The AI parses the system command catalog and recommends matching tools (e.g. Subfinder, Nmap, Testssl, Trivy, Bandit) in an optimal execution order, along with a written strategy and rationale.
- **Validated plans**: Only tools from the command catalog that apply to the target type are accepted from the model, and Reconmap fills in the command arguments itself. If the AI is unavailable or returns nothing usable, a rule-based plan for the chosen objective is used.
- **Tracked execution**: The plan becomes a scan whose tool-by-tool progress is kept on the server and listed under **Scan history**.

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

## Usage and cost tracking

Every AI call is recorded (provider, model, feature, project, user, token counts, latency and estimated cost) and summarised on **System → Usage**. To get a cost estimate, enter the provider's prices per one million input and output tokens in **System → AI Settings**. Without prices, only token counts are shown. See [System monitoring](../../admin-manual/system-monitoring.md) for the full list of metrics.

Provider definitions in `ai-providers.json` can offer the same two price fields by including the `inputPricePerMTok` and `outputPricePerMTok` keys (text fields). The bundled providers already do.

---

## Privacy and data handling

When using Ollama, all inference happens on your own infrastructure — no data is sent to external services.

When using Azure OpenAI, OpenRouter, AnonRouter or OrcaRouter, tool output, vulnerability descriptions, and asset names are sent to the configured third-party provider for inference. Ensure this complies with your organisation's data handling policies and the scope of work agreed with your client.
