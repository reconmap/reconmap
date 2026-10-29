import { type AiUsageBreakdownRow, useSystemUsageQuery } from "api/system";
import { SystemUrls } from "AppUrls";
import FormField from "components/forms/FormField";
import NativeTabs from "components/forms/NativeTabs";
import ClientCacheTable from "components/system/ClientCacheTable";
import Breadcrumb from "components/ui/Breadcrumb";
import FileSizeSpan from "components/ui/FileSizeSpan";
import PageSkeleton from "components/ui/PageSkeleton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RANGE_OPTIONS = [7, 30, 90];

const formatNumber = (value: number) =>
  new Intl.NumberFormat().format(Math.round(value));

const formatCost = (value: number) =>
  `$${value.toFixed(value > 0 && value < 0.01 ? 4 : 2)}`;

const formatPercent = (part: number, total: number) =>
  total === 0 ? "0%" : `${((part / total) * 100).toFixed(1)}%`;

const BreakdownTable = ({
  title,
  label,
  rows,
}: {
  title: string;
  label: string;
  rows: (AiUsageBreakdownRow & { label?: string })[];
}) => {
  if (rows.length === 0) return null;

  return (
    <>
      <h3 className="title is-5 mt-5">{title}</h3>
      <table className="table is-stripped is-fullwidth">
        <thead>
          <tr>
            <th>{label}</th>
            <th>Calls</th>
            <th>Input tokens</th>
            <th>Output tokens</th>
            <th>Estimated cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label ?? row.key}</td>
              <td>{formatNumber(row.calls)}</td>
              <td>{formatNumber(row.inputTokens)}</td>
              <td>{formatNumber(row.outputTokens)}</td>
              <td>{formatCost(row.estimatedCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const SystemUsagePage = () => {
  const [t] = useTranslation();
  const [rangeDays, setRangeDays] = useState(30);
  const [tabIndex, tabIndexSetter] = useState(0);
  const { data: usage, isLoading } = useSystemUsageQuery(rangeDays);

  if (isLoading || !usage) return <PageSkeleton />;

  const { ai, redis } = usage;
  const totalTokens = ai.totals.inputTokens + ai.totals.outputTokens;
  const dailyData = ai.daily.map((d) => ({
    ...d,
    day: d.date.slice(0, 10),
    tokens: d.inputTokens + d.outputTokens,
  }));

  return (
    <div>
      <div className="heading">
        <Breadcrumb />
      </div>
      <PageTitleHeader title={t("System usage")} subHeader={t("System")} />

      <NativeTabs
        labels={[
          t("AI usage"),
          t("Storage"),
          t("Infrastructure"),
          t("Client cache"),
        ]}
        tabIndex={tabIndex}
        tabIndexSetter={tabIndexSetter}
      />

      <div className="content">
        {0 === tabIndex && (
          <>
            <FormField
              htmlFor="usage-range"
              label={t("Time range")}
              control={
                <div className="select">
                  <select
                    id="usage-range"
                    value={rangeDays}
                    onChange={(event) => setRangeDays(Number(event.target.value))}
                  >
                    {RANGE_OPTIONS.map((days) => (
                      <option key={days} value={days}>
                        {t("Last {{days}} days", { days })}
                      </option>
                    ))}
                  </select>
                </div>
              }
            />

            {ai.totals.calls === 0 ? (
              <p>{t("No AI calls were recorded in this period.")}</p>
            ) : (
              <>
                <table className="table is-stripped">
                  <tbody>
                    <tr>
                      <th>Calls</th>
                      <td>{formatNumber(ai.totals.calls)}</td>
                    </tr>
                    <tr>
                      <th>Error rate</th>
                      <td>
                        {formatPercent(ai.totals.failedCalls, ai.totals.calls)}{" "}
                        ({formatNumber(ai.totals.failedCalls)} failed)
                      </td>
                    </tr>
                    <tr>
                      <th>Input tokens</th>
                      <td>{formatNumber(ai.totals.inputTokens)}</td>
                    </tr>
                    <tr>
                      <th>Output tokens</th>
                      <td>{formatNumber(ai.totals.outputTokens)}</td>
                    </tr>
                    <tr>
                      <th>Average tokens per call</th>
                      <td>{formatNumber(totalTokens / ai.totals.calls)}</td>
                    </tr>
                    <tr>
                      <th>Estimated cost</th>
                      <td>
                        {formatCost(ai.totals.estimatedCost)}
                        {ai.totals.estimatedCost === 0 && (
                          <>
                            {" "}
                            <small>
                              <Link to={SystemUrls.AiSettings}>
                                {t(
                                  "Set token prices in the AI settings to estimate cost.",
                                )}
                              </Link>
                            </small>
                          </>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>Latency (average / p95)</th>
                      <td>
                        {formatNumber(ai.totals.averageLatencyMs)} ms /{" "}
                        {formatNumber(ai.totals.p95LatencyMs)} ms
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="title is-5 mt-5">{t("Tokens per day")}</h3>
                <BarChart width={640} height={260} data={dailyData}>
                  <CartesianGrid />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="inputTokens"
                    name={t("Input tokens")}
                    stackId="tokens"
                    fill="#3273dc"
                  />
                  <Bar
                    dataKey="outputTokens"
                    name={t("Output tokens")}
                    stackId="tokens"
                    fill="#48c78e"
                  />
                </BarChart>

                <h3 className="title is-5 mt-5">
                  {t("Estimated cost per day")}
                </h3>
                <BarChart width={640} height={200} data={dailyData}>
                  <CartesianGrid />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCost(Number(value))} />
                  <Bar
                    dataKey="estimatedCost"
                    name={t("Estimated cost")}
                    fill="#ffb70f"
                  />
                </BarChart>

                <BreakdownTable
                  title={t("By feature")}
                  label="Feature"
                  rows={ai.byFeature}
                />
                <BreakdownTable
                  title={t("By model")}
                  label="Provider / model"
                  rows={ai.byModel}
                />
                <BreakdownTable
                  title={t("By project")}
                  label="Project"
                  rows={ai.byProject.map((p) => ({
                    ...p,
                    key: String(p.projectId ?? "none"),
                    label:
                      p.projectId === null
                        ? t("No project")
                        : (p.projectName ?? `#${p.projectId}`),
                  }))}
                />
                <BreakdownTable
                  title={t("By user")}
                  label="User"
                  rows={ai.byUser.map((u) => ({
                    ...u,
                    key: String(u.userId ?? "none"),
                    label:
                      u.userId === null ? t("Unattributed") : `#${u.userId}`,
                  }))}
                />
              </>
            )}
          </>
        )}

        {1 === tabIndex && (
          <>
            <dl>
              <dt>Attachments count</dt>
              <dd>{usage.attachments.totalCount} total</dd>
            </dl>
            <dl>
              <dt>Attachments total disk usage</dt>
              <dd>
                <FileSizeSpan fileSize={usage.attachments.totalFileSize} />
              </dd>
            </dl>
          </>
        )}

        {2 === tabIndex && (
          <>
            <h3 className="title is-5">{t("Key-value server")}</h3>
            {redis.available ? (
              <>
                <dl>
                  <dt>Memory used</dt>
                  <dd>
                    <FileSizeSpan fileSize={redis.usedMemoryBytes} />
                    {redis.maxMemoryBytes > 0 && (
                      <>
                        {" "}
                        of <FileSizeSpan fileSize={redis.maxMemoryBytes} /> (
                        {formatPercent(
                          redis.usedMemoryBytes,
                          redis.maxMemoryBytes,
                        )}
                        )
                      </>
                    )}
                  </dd>
                </dl>
                <dl>
                  <dt>Keys</dt>
                  <dd>{formatNumber(redis.keyCount)}</dd>
                </dl>
              </>
            ) : (
              <p>{t("The key-value server could not be queried.")}</p>
            )}

            <h3 className="title is-5 mt-5">{t("Message queues")}</h3>
            <table className="table is-stripped">
              <thead>
                <tr>
                  <th>Queue name</th>
                  <th>Messages waiting</th>
                  <th>Consumers</th>
                </tr>
              </thead>
              <tbody>
                {usage.queues.map((queue) => (
                  <tr key={queue.name}>
                    <td>{queue.name}</td>
                    <td>{formatNumber(queue.messages)}</td>
                    <td>{formatNumber(queue.consumers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {3 === tabIndex && <ClientCacheTable />}
      </div>
    </div>
  );
};

export default SystemUsagePage;
