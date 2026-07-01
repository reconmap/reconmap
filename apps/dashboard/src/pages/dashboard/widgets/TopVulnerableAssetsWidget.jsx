import { useVulnerabilitiesQuery } from "api/vulnerabilities.js";
import Loading from "components/ui/Loading.jsx";
import DashboardWidget from "./Widget.jsx";
import { Link } from "react-router-dom";

const TopVulnerableAssetsWidget = () => {
    const {
        data: vulnerabilities,
        isLoading,
        isError,
        error,
    } = useVulnerabilitiesQuery({
        isTemplate: false,
        limit: 100,
    });

    if (isLoading) return <Loading />;
    if (isError) return <p className="has-text-danger">Error loading vulnerabilities: {error.message}</p>;

    const assetCountsMap = {};
    if (vulnerabilities && vulnerabilities.data) {
        vulnerabilities.data.forEach((vuln) => {
            if (vuln.assetId && vuln.asset) {
                const assetId = vuln.assetId;
                if (!assetCountsMap[assetId]) {
                    assetCountsMap[assetId] = {
                        id: assetId,
                        name: vuln.asset.name,
                        type: vuln.asset.type,
                        critical: 0,
                        high: 0,
                        medium: 0,
                        low: 0,
                        none: 0,
                        total: 0,
                    };
                }
                assetCountsMap[assetId].total += 1;
                const risk = vuln.risk ? vuln.risk.toLowerCase() : "none";
                if (risk in assetCountsMap[assetId]) {
                    assetCountsMap[assetId][risk] += 1;
                } else {
                    assetCountsMap[assetId].none += 1;
                }
            }
        });
    }

    const sortedAssets = Object.values(assetCountsMap)
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
        .slice(0, 5);

    return (
        <DashboardWidget title="Top vulnerable assets">
            {sortedAssets.length > 0 ? (
                <table className="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Type</th>
                            <th className="has-text-centered">Vulnerabilities</th>
                            <th>Breakdown</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAssets.map((asset) => (
                            <tr key={asset.id}>
                                <td>
                                    <Link to={`/assets/${asset.id}`}><strong>{asset.name}</strong></Link>
                                </td>
                                <td>
                                    <span className="tag is-light">{asset.type}</span>
                                </td>
                                <td className="has-text-centered">
                                    <span className="tag is-danger is-light"><strong>{asset.total}</strong></span>
                                </td>
                                <td>
                                    <div className="tags" style={{ gap: "4px", marginBottom: 0 }}>
                                        {asset.critical > 0 && <span className="tag is-danger" title="Critical" style={{ background: "#ff3860", margin: 0 }}>{asset.critical} C</span>}
                                        {asset.high > 0 && <span className="tag is-warning" title="High" style={{ background: "#ffdd57", color: "rgba(0,0,0,0.7)", margin: 0 }}>{asset.high} H</span>}
                                        {asset.medium > 0 && <span className="tag is-info" title="Medium" style={{ background: "#209cee", margin: 0 }}>{asset.medium} M</span>}
                                        {asset.low > 0 && <span className="tag is-link" title="Low" style={{ background: "#3273dc", margin: 0 }}>{asset.low} L</span>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No vulnerable assets found.</p>
            )}
        </DashboardWidget>
    );
};

export default TopVulnerableAssetsWidget;
