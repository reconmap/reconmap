# Access Control (OPA / Rego)

Reconmap utilizes Open Policy Agent (OPA) combined with Rego policies to enforce fine-grained Attribute-Based Access Control (ABAC).

## OPA Integration

OPA is deployed as a container within the Docker Compose (`compose.yaml`) and Kubernetes definitions. 
The C# API intercepts incoming requests and queries the OPA server to verify if the requesting user has permission to perform the desired action. The target OPA endpoint is dynamically configured via the `OPA_SERVER_URL` variable in the root `.env` file (which defaults to `http://opa:8181` inside the Docker network).

### Default Policies

The default policies are located in `policy/authz.rego`. By default:
- **Administrators** have unrestricted access to all resources.
- **Clients** are restricted and can only access projects they are explicitly assigned to as project members.

### Modifying Policies

You can customize the authorization logic by modifying the `policy/authz.rego` file. Changes take effect automatically, as the OPA container mounts this directory as a volume.

### Audit Logging

Any request that fails OPA authorization is logged into the `audit_log` table with the action `opa_authz_failed`. 
This allows system administrators to monitor and track unauthorized access attempts to restricted resources, meeting compliance and security auditing requirements.
