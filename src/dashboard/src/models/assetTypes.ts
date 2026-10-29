// Types are free-form: tools can invent their own. These are only well-known hints used for icons and suggestions.
type AssetTypeHint = {
    value: string;
    icon: string;
    description: string;
};

const AssetTypeHints: AssetTypeHint[] = [
    { value: "hostname", icon: "🖥️", description: "Hostname (e.g. saturn.pc.net)" },
    { value: "ip_address", icon: "🖥️", description: "IP address (e.g. 172.16.254.1)" },
    { value: "cidr_range", icon: "🌐", description: "CIDR range (e.g. 192.168.100.0/24)" },
    { value: "port", icon: "🔌", description: "Port or service (e.g. 443/tcp)" },
    { value: "url", icon: "🔗", description: "URL (e.g. https://webapp.net)" },
    { value: "path", icon: "📁", description: "Path in a web application (e.g. /admin)" },
    { value: "file", icon: "📄", description: "File (e.g. /.env)" },
    { value: "package", icon: "📦", description: "Software package (e.g. lodash@4.17.21)" },
    { value: "binary", icon: "⚙️", description: "Binary" },
];

const DEFAULT_ICON = "🎯";

export const iconForType = (type?: string | null) =>
    AssetTypeHints.find((hint) => hint.value === type)?.icon ?? DEFAULT_ICON;

export default AssetTypeHints;
