#set page(margin: 2cm)
#set text(size: 11pt)
#set par(leading: 1.4em)

= Penetration Test Report

*Project:* {{ project != null && project.name != null ? project.name : "" }} \
*Prepared for:* {{ client != null && client.name != null ? client.name : "" }} \
*Prepared by:* {{ serviceProvider != null && serviceProvider.name != null ? serviceProvider.name : "" }} \
*Date:* {{ date != null ? date : "" }}

{{ if lastRevisionName != null }}
*Last revision:* {{ lastRevisionName }}
{{ end }}

---

{{ if revisions != null && revisions.size > 0 }}
== Revisions

#table(
  columns: (2fr, 3fr, 5fr),
  inset: 6pt,
  [
    *Date* | *Revision name* | *Description*
  ],
  {{ for revision in revisions }}
  [
    {{ revision.insert_ts != null ? revision.insert_ts : "" }} |
    {{ revision.version_name != null ? revision.version_name : "" }} |
    {{ revision.version_description != null ? revision.version_description : "" }}
  ],
  {{ end }}
)
{{ end }}

---

== Client

*Name*  
{{ client != null && client.name != null ? client.name : "" }}

*Address*  
{{ client != null && client.address != null ? client.address : "" }}

*URL*  
{{ client != null && client.url != null ? client.url : "" }}

*Contacts*
{{ for c in (client != null && client.contacts != null ? client.contacts : empty_array) }}
- *Name:* {{ c.name != null ? c.name : "" }}
- *Phone:* {{ c.phone != null ? c.phone : "" }}
- *Email:* {{ c.email != null ? c.email : "" }}
- *Role:* {{ c.role != null ? c.role : "" }}
{{ end }}

---

== Pentesting Team

{{ for u in (users != null ? users : empty_array) }}
- *{{ u.full_name != null ? u.full_name : "" }}*  
  {{ u.short_bio != null ? u.short_bio : "" }}
{{ end }}

---

== Project Overview

{{ project != null && project.description != null ? project.description : "" }}

=== Findings Overview

#table(
  columns: (3fr, 1fr),
  inset: 6pt,
  [
    *Severity* | *Count*
  ],
  {{ for f in (findings != null && findings.stats != null ? findings.stats : empty_array) }}
  [
    {{ f.severity != null ? string.capitalize f.severity : "" }} |
    {{ f.count != null ? f.count : "0" }}
  ],
  {{ end }}
)

---

== Assets

#table(
  columns: (3fr, 2fr),
  inset: 6pt,
  [
    *Target Name* | *Type*
  ],
  {{ for a in (assets != null ? assets : empty_array) }}
  [
    {{ a.name != null ? a.name : "" }} |
    {{ a.kind != null ? a.kind : "" }}
  ],
  {{ end }}
)

---

== Findings

{{ for v in (findings != null && findings.list != null ? findings.list : empty_array) }}

=== {{ v.summary != null ? v.summary : "" }}

*Category:* {{ v.category_name != null ? v.category_name : "" }}  
*Severity:* {{ v.risk != null ? string.capitalize v.risk : "" }}  
*CVSS Score:* {{ v.cvss_score != null ? v.cvss_score : "" }}  
*OWASP Vector:* {{ v.owasp_vector != null ? v.owasp_vector : "" }}  
*OWASP Overall Rating:* {{ v.owasp_overall != null ? v.owasp_overall : "" }}

*Description*  
{{ v.description != null ? v.description : "" }}

*Proof of Concept*  
{{ v.proof_of_concept != null ? v.proof_of_concept : "" }}

*Remediation*  
{{ v.remediation != null ? v.remediation : "" }}

---
{{ end }}
