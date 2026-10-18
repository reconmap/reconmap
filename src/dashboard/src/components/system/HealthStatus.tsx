type HealthState = "up" | "down" | "unknown";

interface HealthStatusProps {
    state: HealthState;
    upLabel?: string;
    downLabel?: string;
    unknownLabel?: string;
    latencyMs?: number | null;
}

const stateClasses: Record<HealthState, string> = {
    up: "has-text-success",
    down: "has-text-danger",
    unknown: "has-text-grey",
};

const HealthStatus = ({ state, upLabel = "Ok", downLabel = "Down", unknownLabel = "Not configured", latencyMs }: HealthStatusProps) => {
    const label = state === "up" ? upLabel : state === "down" ? downLabel : unknownLabel;

    return (
        <span className={stateClasses[state]}>
            <strong>{label}</strong>
            {state === "up" && latencyMs !== undefined && latencyMs !== null && (
                <small className="has-text-grey"> ({latencyMs} ms)</small>
            )}
        </span>
    );
};

const toHealthState = (reachable: boolean): HealthState => (reachable ? "up" : "down");

export default HealthStatus;
export { toHealthState };
export type { HealthState };
