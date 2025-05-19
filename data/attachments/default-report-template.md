# Penetration Test Report

**Project:** {{ project.name }}  
**Prepared for:** {{ client.name }}  
**Prepared by:** {{ org.name }}  
**Date:** {{ date }}

---

## Revisions

{% for version in reports %}
- **{{ version.insert_ts }}**  
  _{{ version.version_name }}_ — {{ version.version_description }}
{% endfor %}

---

## Contacts

{% for contact in contacts %}
- **Name:** {{ contact.name }}  
  **Phone:** {{ contact.phone }}  
  **Email:** {{ contact.email }}  
  **Role:** {{ contact.role }}

{% endfor %}

---

## Pentesting Team

{% for user in users %}
- **{{ user.full_name }}**  
  _{{ user.short_bio }}_
{% endfor %}

---

## Project Overview

{{ project.description }}

{% for finding in findingsOverview %}
- **{{ finding.severity|capitalize }}:** {{ finding.count }}
{% endfor %}

---

## Targets

{% for target in targets %}
- **{{ target.name }}** (_{{ target.kind }}_)
{% endfor %}

---

## Vulnerabilities

{% for vulnerability in vulnerabilities %}
### {{ vulnerability.summary }}

- **Category:** {{ vulnerability.category_name }}  
- **Severity:** {{ vulnerability.risk|capitalize }}  
- **CVSS Score:** {{ vulnerability.cvss_score }}  
- **OWASP Vector:** {{ vulnerability.owasp_vector }}  
- **OWASP Overall Rating:** {{ vulnerability.owasp_overall }}

**Description:**  
{{ vulnerability.description }}

**Proof of Concept:**  
{{ vulnerability.proof_of_concept }}

**Remediation:**  
{{ vulnerability.remediation }}

---
{% endfor %}

