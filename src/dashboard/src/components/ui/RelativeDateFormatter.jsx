import ReactTimeAgo from "react-time-ago";

const RelativeDateFormatter = ({ date: dateString }) => {
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

    return <ReactTimeAgo date={timestamp} locale="en-UK" />;
};

export default RelativeDateFormatter;
