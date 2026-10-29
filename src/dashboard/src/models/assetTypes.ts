// Types are free-form: tools can invent their own. These are only well-known hints used for icons and suggestions.
type AssetTypeHint = {
    value: string;
    icon: string;
    description: string;
};

const AssetTypeHints: AssetTypeHint[] = [
    // Targets typically reported by DAST scanners
    { value: "hostname", icon: "🞖🞖", description: "Host scanned (e.g. app.example.com)" },
    { value: "ip_address", icon: "🞖🞜", description: "IP address (e.g. 172.16.254.1)" },
    { value: "port", icon: "🞖🞋", description: "Network service (e.g. 443/tcp)" },
    { value: "url", icon: "🞜🞖", description: "Web page or API endpoint (e.g. https://app.example.com/api/users)" },
    { value: "parameter", icon: "🞜🞜", description: "Request parameter, header, cookie or body field (e.g. id, X-Forwarded-For)" },
    { value: "api_operation", icon: "🞜🞋", description: "API operation (e.g. POST /v1/orders)" },
    { value: "tls_certificate", icon: "🞋🞖", description: "TLS certificate or cipher configuration (e.g. app.example.com:443)" },
    // Targets typically reported by SAST, SCA, secrets and IaC scanners
    { value: "repository", icon: "🞋🞜", description: "Source code repository (e.g. github.com/acme/webapp)" },
    { value: "file", icon: "🞋🞋", description: "Source or config file (e.g. src/auth/login.ts, .env)" },
    { value: "code_location", icon: "🞖🞖🞖", description: "File and line of a code flaw (e.g. src/db/query.ts:42)" },
    { value: "function", icon: "🞖🞖🞜", description: "Function or method (e.g. UserController.login)" },
    { value: "package", icon: "🞖🞖🞋", description: "Third-party dependency (e.g. lodash@4.17.21)" },
    { value: "secret", icon: "🞖🞜🞜", description: "Hardcoded credential or key (e.g. AWS access key in config.js)" },
    { value: "container_image", icon: "🞖🞜🞋", description: "Container image (e.g. nginx:1.25.3)" },
    { value: "iac_resource", icon: "🞖🞋🞋", description: "Infrastructure-as-code resource (e.g. aws_s3_bucket.logs)" },
    { value: "binary", icon: "🞜🞜🞜", description: "Compiled artifact (e.g. app.jar, libssl.so.1.1)" },
];

const DEFAULT_ICON = "🞋";

export const iconForType = (type?: string | null) =>
    AssetTypeHints.find((hint) => hint.value === type)?.icon ?? DEFAULT_ICON;

export default AssetTypeHints;
