const formatter = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["week", 7 * 24 * 60 * 60],
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
];

export const formatRelativeTime = (timestamp: number, now: number = Date.now()): string => {
    const diffSeconds = Math.round((timestamp - now) / 1000);
    for (const [unit, seconds] of units) {
        if (Math.abs(diffSeconds) >= seconds) {
            return formatter.format(Math.trunc(diffSeconds / seconds), unit);
        }
    }
    return formatter.format(diffSeconds, "second");
};

const RelativeDateFormatter = ({ date: dateString }: any) => {
    if (!dateString) {
        console.warn("RelativeDateFormatter: No date provided");
        return null;
    }
    let timestamp = Date.parse(dateString);
    if (isNaN(timestamp)) {
        dateString = dateString.replaceAll("-", "/");
        timestamp = Date.parse(dateString);
    }
    if (isNaN(timestamp)) {
        return dateString;
    }

    return <time dateTime={new Date(timestamp).toISOString()}>{formatRelativeTime(timestamp)}</time>;
};

export default RelativeDateFormatter;
