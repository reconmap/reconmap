const convertReadyStateToText = (connection: { readyState: number } | null) => {
    if (connection === null) {
        return "(unknown)";
    }
    if (typeof EventSource !== "undefined" && connection instanceof EventSource) {
        const sseStates = ["Connecting", "Open", "Closed"];
        return sseStates[connection.readyState] || "(unknown)";
    }
    const states = ["Connecting", "Open", "Closing", "Closed"];
    return states[connection.readyState] || "(unknown)";
};

export default convertReadyStateToText;
