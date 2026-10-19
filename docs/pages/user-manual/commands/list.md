---
title: Commands list
parent: Commands
grand_parent: User manual
---

Reconmap commands are fully defined in code, integrating both the runner definitions (executable path, flags, arguments) and the output parsers directly.

### Automatic Scan Planning & Tool Chaining

Instead of manually picking which security tools to run, the **Scans** page now features an intelligent, target-centric scan planning workflow:

1. **Enter Target**: Specify a target URL, domain, IP, hostname, or code repository. If a URL target is specified, Reconmap automatically adds/ensures it as a target/asset in the selected project.
2. **Objective**: Choose a scan goal. Each objective only runs tools that make sense for the target type:
    - *Full reconnaissance*: every applicable tool (for example Subfinder only for domains, code scanners only for code repositories).
    - *Web scan*: shcheck, testssl and Nmap.
    - *SSL/TLS check*: testssl.
    - *Code audit*: Bandit, Semgrep, Snyk, Trivy and Syft (code repositories).
   If no tool supports the chosen objective for the target type, the scan is not started and the reason is shown.
3. **AI-Powered Recommendation**: If an AI provider is configured under **System → AI Settings**, Reconmap asks the LLM to choose and order tools from the catalog. Tools that are not in the catalog or do not apply to the target are discarded, and if nothing valid is left the rule-based matching engine is used instead. Command arguments are always filled in by Reconmap (for example the host of a URL for Nmap), never by the model.
4. **Tracked job execution**: Starting the scan creates a *scan* with one task per tool and opens its page. Each task shows the exact command that will run, its rationale and its status (Queued, Running, Succeeded or Failed, with the error when it fails). The scan is stored on the server and continues if you close the page or navigate away: open **Scan history** (or the **Recent scans** list on **Run scan**) at any time to see running and past scans. Tasks are also visible, until they run, in **View scheduled scans**.
5. **Results**: When a tool finishes, the runner uploads its output to Reconmap, which parses it into the project's assets and vulnerabilities (see [command result processing](command-result-processing.md)). A scan is *Partially failed* when only some tools failed.

Runners execute the command line stored in the scan task. A command line that still contains an unresolved `{{{placeholder}}}` is never executed; the task is marked as failed instead.

### Command Library Removal

To simplify platform workflows, the manual **Commands Library** CRUD pages and tool dropdown selection options have been completely removed from the user interface. Command definitions and usages are managed internally by the codebase. For uploading external reports manually, the **Import scan** page continues to support optional command selection.

