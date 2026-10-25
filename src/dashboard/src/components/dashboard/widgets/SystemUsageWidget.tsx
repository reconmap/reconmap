import { useSystemUsageQuery } from "api/system";
import { SystemUrls } from "AppUrls";
import FileSizeSpan from "components/ui/FileSizeSpan";
import { Link } from "react-router";
import DashboardWidget from "./DashboardWidget";

const RANGE_DAYS = 30;

const formatNumber = (value: number) => new Intl.NumberFormat().format(Math.round(value));

const formatCost = (value: number) => `$${value.toFixed(value > 0 && value < 0.01 ? 4 : 2)}`;

const SystemUsageWidget = () => {
    const { data: usage, isError } = useSystemUsageQuery(RANGE_DAYS);

    return (
        <DashboardWidget title="System usage">
            {isError && <p className="has-text-danger">Unable to load system usage.</p>}
            {usage && (
                <>
                    <dl>
                        <dt>AI calls (last {RANGE_DAYS} days)</dt>
                        <dd>{formatNumber(usage.ai.totals.calls)}</dd>

                        <dt>AI tokens (input / output)</dt>
                        <dd>
                            {formatNumber(usage.ai.totals.inputTokens)} / {formatNumber(usage.ai.totals.outputTokens)}
                        </dd>

                        <dt>AI estimated cost</dt>
                        <dd>{formatCost(usage.ai.totals.estimatedCost)}</dd>

                        <dt>Attachments</dt>
                        <dd>
                            {formatNumber(usage.attachments.totalCount)} (<FileSizeSpan fileSize={usage.attachments.totalFileSize} />)
                        </dd>

                        <dt>Key-value server memory</dt>
                        <dd>{usage.redis.available ? <FileSizeSpan fileSize={usage.redis.usedMemoryBytes} /> : "Unavailable"}</dd>

                        <dt>Messages waiting in queues</dt>
                        <dd>{formatNumber(usage.queues.reduce((total, queue) => total + queue.messages, 0))}</dd>
                    </dl>
                    <Link to={SystemUrls.Usage}>View details</Link>
                </>
            )}
        </DashboardWidget>
    );
};

export default SystemUsageWidget;
