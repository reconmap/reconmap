const states: string[] = ["Connecting", "Open", "Closing", "Closed"];

const convertReadyStateToText = (webSocketConnection: { readyState: number } | null) => {
    if (webSocketConnection === null) {
        return "(unknown)";
    }
    return states[webSocketConnection.readyState];
};

export default convertReadyStateToText;
