import { UAParser } from "ua-parser-js";

const UserAgentLabel = ({ userAgent }: any) => {
    const parser = new UAParser(userAgent);
    const browserName = parser.getBrowser().name;

    let description: any = null;
    if (browserName) {
        description = `${parser.getBrowser().name} on ${parser.getOS().name}`;
    } else {
        description = userAgent;
    }

    return <span title={userAgent}>{description}</span>;
};

export default UserAgentLabel;
