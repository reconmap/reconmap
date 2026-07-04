---
title: "Command result processing"
parent: Commands
grand_parent: User manual
---

Reconmap can parse the output of many security tools, and incorporate their results in one of your projects. The instructions below show how to do so step by step.

Reconmap also provides a URL-first scan launcher under **Scans -> Start from URL**. Use it when you want to launch a web-target scan from a project and an explicit URL. Reconmap will create a URL asset for that project if it does not already exist, then prepare a command usage that accepts the `URL` placeholder.

### Step 1 - Choose a command under Scans

Reconmap has built-in, code-defined commands and usages. You do not need to manually configure executable paths or associate output parsers.
Go to the **Scans** page and select the command you want to run. Choosing the specific command usage is handled internally and determined automatically by the system's LLM.

Reconmap supports several built-in output parsers, including:
* **Sarif**: Parses Static Analysis Results Interchange Format (SARIF) JSON files (e.g. produced by `gosec`, `semgrep`, `trivy`, or `gitleaks`). It extracts vulnerabilities, maps severity levels to Reconmap risk levels, maps source code locations to proof of concepts, and copies rule details/descriptions.
* **CycloneDX**: Parses CycloneDX Software Bill of Materials (SBOM) JSON files (e.g. produced by `syft` or `trivy`). It extracts packages/dependencies as assets and embeds vulnerability scanner disclosures as linked vulnerabilities.
* **Nmap**: Parses Nmap XML files to extract hosts and open ports as assets.
* **Shcheck**: Parses security header analysis vulnerabilities.
* **Subfinder**: Parses subdomain discovery outputs.
* **Testssl**: Parses SSL/TLS configuration test outputs.

### Step 2 - Running the command and uploading the results

All scans now require a selected target project where the findings will be saved. When configuring a run, choose the target project from the project dropdown. The previously available "Vulnerabilities storage action" option has been removed, making the project selection mandatory for all scan executions.

Run the command from the Scans page using the integrated web terminal (connected to a Reconmap agent). The agent will execute the command, capture the output, and automatically upload the results to the server for processing. Manual execution via a local `rmap` command line client is not supported.

### Step 3 - Waiting for results

The file is now on the system and will be processed in the background. Vulnerabilities and assets found in the scan output file are created automatically on the selected Reconmap project.
