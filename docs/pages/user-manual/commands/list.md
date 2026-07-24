---
title: Commands list
parent: Commands
grand_parent: User manual
---

Reconmap commands are fully defined in code, integrating both the runner definitions (executable path, flags, arguments) and the output parsers directly.

### Automatic Scan Planning & Tool Chaining

Instead of manually picking which security tools to run, the **Scans** page now features an intelligent, target-centric scan planning workflow:

1. **Enter Target**: Specify a target URL, domain, IP, hostname, or code repository. If a URL target is specified, Reconmap automatically adds/ensures it as a target/asset in the selected project.
2. **Objective (Optional)**: Choose a scan goal, such as Web scan, Full recon, Code audit, or SSL/TLS check.
3. **AI-Powered Recommendation**: The system automatically analyzes the target. If an AI provider is configured under **System → AI Settings**, Reconmap uses the LLM to design an optimal, ordered toolchain strategy and rationale. If AI is not configured, the system falls back to a rule-based matching engine.
4. **Transparent Job Execution**: Once the scan is started, the system transparently queues each recommended tool as a separate background job in the runner queue. The UI displays the execution progress (e.g. Pending, Queuing, Queued, Failed) without requiring manual tool selection or manual queue actions. All jobs are visible in **View scheduled scans**.

### Command Library Removal

To simplify platform workflows, the manual **Commands Library** CRUD pages and tool dropdown selection options have been completely removed from the user interface. Command definitions and usages are managed internally by the codebase. For uploading external reports manually, the **Import scan** page continues to support optional command selection.

