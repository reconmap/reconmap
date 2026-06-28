---
title: "Command result processing"
parent: Commands
grand_parent: User manual
---

Reconmap can parse the output of many security tools, and incorporate their results in one of your projects. The instructions below show how to do so step by step.

### Step 1 - Choose a command usage under Scans

Reconmap has built-in, code-defined commands and usages. You do not need to manually configure executable paths or associate output parsers.
Go to the **Scans** page and select the command and its usage you want to run.

Reconmap supports several built-in output parsers, including:
* **Sarif**: Parses Static Analysis Results Interchange Format (SARIF) JSON files (e.g. produced by `gosec`, `semgrep`, `trivy`, or `gitleaks`). It extracts findings, maps severity levels to Reconmap risk levels, maps source code locations to proof of concepts, and copies rule details/descriptions.
* **CycloneDX**: Parses CycloneDX Software Bill of Materials (SBOM) JSON files (e.g. produced by `syft` or `trivy`). It extracts packages/dependencies as assets and embeds vulnerability scanner disclosures as linked findings.
* **Nmap**: Parses Nmap XML files to extract target hosts and open ports as assets.
* **Shcheck**: Parses security header analysis findings.
* **Subfinder**: Parses subdomain discovery outputs.
* **Testssl**: Parses SSL/TLS configuration test outputs.

### Step 2 - Running the command and uploading the results

Copy the command from the Scans page to your terminal (running the `rmap` CLI) or the integrated web terminal. The `rmap` CLI will execute the command, capture the output, and automatically upload the results to the server for processing.

### Step 3 - Waiting for results

The file is now on the system and will be processed in the background. Vulnerabilities and target hosts found in the scan output file are created automatically on the selected Reconmap project.
