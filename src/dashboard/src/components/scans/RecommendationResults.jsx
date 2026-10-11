import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { requestCommandSchedulePost } from 'api/requests/commands.js';

const RecommendationResults = ({ recommendations, projectId, onQueued }) => {
    const { t } = useTranslation();
    const [queuing, setQueuing] = useState(false);
    const [queuedIds, setQueuedIds] = useState(new Set());
    const [failedIds, setFailedIds] = useState(new Set());
    const [currentlyQueuingId, setCurrentlyQueuingId] = useState(null);

    useEffect(() => {
        if (!recommendations || !recommendations.recommendations) return;
        let active = true;

        const autoQueueAll = async () => {
            setQueuing(true);
            try {
                for (const rec of recommendations.recommendations) {
                    if (!active) break;
                    if (queuedIds.has(rec.commandId) || failedIds.has(rec.commandId)) continue;

                    setCurrentlyQueuingId(rec.commandId);
                    try {
                        const schedulePayload = {
                            projectId: projectId,
                            argumentValues: JSON.stringify(rec.argumentValues || {}),
                            cronExpression: 'once'
                        };
                        await requestCommandSchedulePost(rec.commandId, schedulePayload);
                        if (active) {
                            setQueuedIds(prev => {
                                const next = new Set(prev);
                                next.add(rec.commandId);
                                return next;
                            });
                        }
                    } catch (e) {
                        console.error("Failed to transparently queue tool " + rec.commandName, e);
                        if (active) {
                            setFailedIds(prev => {
                                const next = new Set(prev);
                                next.add(rec.commandId);
                                return next;
                            });
                        }
                    }
                }
                if (active) {
                    setCurrentlyQueuingId(null);
                    setQueuing(false);
                    if (onQueued) onQueued();
                }
            } catch (err) {
                console.error("Error in transparent auto-queueing", err);
                if (active) {
                    setQueuing(false);
                    setCurrentlyQueuingId(null);
                }
            }
        };

        autoQueueAll();
        return () => { active = false; };
    }, [recommendations, projectId]);

    if (!recommendations) return null;

    return (
        <div className="recommendations-results mt-5">
            <div className="notification is-info is-light">
                <strong>{t("Strategy")}: </strong>
                {recommendations.strategy}
            </div>
            
            <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
                <h3 className="title is-4">{t("Running Scan Strategy")}</h3>
                {queuing && (
                    <span className="tag is-info is-light is-medium">
                        {t("Executing recommended tools...")}
                    </span>
                )}
                {!queuing && queuedIds.size > 0 && (
                    <span className="tag is-success is-light is-medium">
                        {t("All tools queued successfully")}
                    </span>
                )}
            </div>

            <div className="columns is-multiline">
                {recommendations.recommendations.map((rec) => {
                    const isQueued = queuedIds.has(rec.commandId);
                    const isFailed = failedIds.has(rec.commandId);
                    const isQueuingThis = currentlyQueuingId === rec.commandId;

                    let statusTag = null;
                    if (isQueued) {
                        statusTag = <span className="tag is-success">{t("Queued")}</span>;
                    } else if (isFailed) {
                        statusTag = <span className="tag is-danger">{t("Failed")}</span>;
                    } else if (isQueuingThis) {
                        statusTag = <span className="tag is-info is-light">{t("Queuing...")}</span>;
                    } else {
                        statusTag = <span className="tag is-light">{t("Pending")}</span>;
                    }

                    return (
                        <div key={rec.commandId} className="column is-12">
                            <div className="card">
                                <div className="card-content">
                                    <div className="is-flex is-justify-content-space-between is-align-items-center">
                                        <div>
                                            <span className="tag is-info mr-2">#{rec.order}</span>
                                            <strong>{rec.commandName}</strong>
                                        </div>
                                        <div>
                                            {statusTag}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-muted">{rec.rationale}</p>
                                    {rec.argumentValues && Object.keys(rec.argumentValues).length > 0 && (
                                        <div className="mt-2">
                                            <div className="tags">
                                                {Object.entries(rec.argumentValues).map(([k, v]) => (
                                                    <span key={k} className="tag is-light">{k}: {v}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendationResults;

