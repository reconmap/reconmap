---
title: Report template variables
parent: Reports
grand_parent: User manual
---

When you are designing your pentest project template, you can reference a number of variables at your disposal that populate the information on your reports. The complete list of template variables is documented below:

<table>
    <thead>
        <tr>
            <th>Variable</th>
            <th>Type</th>
            <th>Description</th>
            <th>Attributes</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>date</td>
            <td>string</td>
            <td>Current date (dd/mm/yyyy)</td>
            <td>(n/a)</td>
        </tr>
        <tr>
            <td>revisions</td>
            <td>array</td>
            <td>Report's revisions</td>
            <td>dateTime, versionName, versionDescription</td>
        </tr>
        <tr>
            <td>lastRevisionName</td>
            <td>string</td>
            <td>Last revision name</td>
            <td>(n/a)</td>
        </tr>
        <tr>
            <td>serviceProvider</td>
            <td>array</td>
            <td>Your service provider organisation</td>
            <td>name, address, url, logo, smallLogo, contacts (name, role, email, phone)</td>
        </tr>
        <tr>
            <td>client</td>
            <td>array</td>
            <td>Project's client</td>
            <td>name, address, url, logo, smallLogo, contacts (name, role, email, phone)</td>
        </tr>
        <tr>
            <td>project</td>
            <td>array</td>
            <td>Project information</td>
            <td>name, description, engagement_type, engagement_start_date, engagement_end_date, external_id</td>
        </tr>
        <tr>
            <td>users</td>
            <td>array</td>
            <td>Project's users</td>
            <td>full_name, short_bio, email, role</td>
        </tr>
        <tr>
            <td>assets</td>
            <td>array</td>
            <td>Project's assets</td>
            <td>name, kind, tags</td>
        </tr>
        <tr>
            <td>tasks</td>
            <td>array</td>
            <td>Project's tasks</td>
            <td>summary, description, status, priority</td>
        </tr>
        <tr>
            <td>findings</td>
            <td>array</td>
            <td>Findings stats and list</td>
            <td>list (summary, description, risk, remediation, status, cvss_score, cvss_vector, proof_of_concept, owasp_vector, owasp_overall), stats (severity, count)</td>
        </tr>
    </tbody>
</table>
