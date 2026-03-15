type TargetKind = {
    value: string;
    description: string;
};

const TargetKinds: TargetKind[] = [
    { value: "hostname", description: "Hostname (e.g. saturn.pc.net, en.wikipedia.org)" },
    { value: "ip_address", description: "IP address (e.g. 172.16.254.1, 2001:db8::)" },
    { value: "cidr_range", description: "CIDR range (e.g. 192.168.100.0/24, 2001:DB8::/48)" },
    { value: "url", description: "URL (e.g. https://webapp.net, ftp://198.127.2.3)" },
];

export default TargetKinds;
