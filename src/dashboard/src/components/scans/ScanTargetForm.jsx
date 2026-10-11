import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectsQuery } from 'api/projects.js';
import NativeSelect from 'components/forms/NativeSelect.jsx';
import HorizontalLabelledField from 'components/forms/HorizontalLabelledField.jsx';
import { requestToolRecommendation } from 'api/requests/recommendations.js';
import { ensureUrlAsset } from 'services/scans/url';
import RecommendationResults from './RecommendationResults.jsx';

const detectTargetType = (target) => {
    if (/^https?:\/\//i.test(target)) return "url";
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(target)) return "ip";
    if (/^(git@|https:\/\/.*\.git)/.test(target)) return "code_repo";
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(target)) return "domain";
    return "hostname";
};

const ScanTargetForm = () => {
    const { t } = useTranslation();
    const [target, setTarget] = useState("");
    const [objective, setObjective] = useState("Full reconnaissance");
    const [projectId, setProjectId] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [queuedMessage, setQueuedMessage] = useState("");

    const { data: projects } = useProjectsQuery({ isTemplate: false, status: "active" });

    const handleTargetChange = (e) => {
        setTarget(e.target.value);
        setRecommendations(null);
        setQueuedMessage("");
    };

    const targetType = target ? detectTargetType(target) : "";

    const onAnalyze = async () => {
        if (!target || !projectId) return;
        setAnalyzing(true);
        setRecommendations(null);
        setQueuedMessage("");
        try {
            if (targetType === "url") {
                await ensureUrlAsset(parseInt(projectId, 10), target);
            }
            const data = await requestToolRecommendation({
                target,
                targetType,
                objective,
                projectId: parseInt(projectId, 10)
            });
            setRecommendations(await data.json());
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="content">
            <HorizontalLabelledField
                label={t("Project")}
                control={
                    <NativeSelect onChange={(e) => setProjectId(e.target.value)} value={projectId}>
                        <option value="">{t("(select project)")}</option>
                        {projects?.data.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </NativeSelect>
                }
            />

            <HorizontalLabelledField
                label={t("Target")}
                control={
                    <div className="field has-addons">
                        <div className="control is-expanded">
                            <input 
                                className="input" 
                                type="text" 
                                placeholder={t("e.g. https://example.com, 192.168.1.1, example.com")}
                                value={target}
                                onChange={handleTargetChange}
                            />
                        </div>
                        {targetType && (
                            <div className="control">
                                <span className="button is-static">{targetType}</span>
                            </div>
                        )}
                    </div>
                }
            />

            <HorizontalLabelledField
                label={t("Objective")}
                control={
                    <NativeSelect onChange={(e) => setObjective(e.target.value)} value={objective}>
                        <option value="Full reconnaissance">{t("Full reconnaissance")}</option>
                        <option value="Web scan">{t("Web scan")}</option>
                        <option value="Code audit">{t("Code audit")}</option>
                        <option value="SSL/TLS check">{t("SSL/TLS check")}</option>
                    </NativeSelect>
                }
            />

            <div className="field">
                <div className="control">
                    <button 
                        className={`button is-primary ${analyzing ? 'is-loading' : ''}`}
                        onClick={onAnalyze}
                        disabled={!target || !projectId || analyzing}
                    >
                        {t("Start scan")}
                    </button>
                </div>
            </div>

            {queuedMessage && (
                <div className="notification is-success is-light mt-4">
                    {queuedMessage}
                </div>
            )}

            {recommendations && (
                <RecommendationResults 
                    recommendations={recommendations} 
                    projectId={parseInt(projectId, 10)}
                    onQueued={() => setQueuedMessage(t("Successfully queued tool(s)."))}
                />
            )}
        </div>
    );
};

export default ScanTargetForm;
