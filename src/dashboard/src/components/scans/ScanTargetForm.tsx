import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectsQuery } from 'api/projects.js';
import NativeSelect from 'components/forms/NativeSelect.jsx';
import FormField from "components/forms/FormField";
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { requestScanRunPost } from 'api/requests/scans.js';
import { ensureUrlAsset } from 'services/scans/url';
import { toast } from "components/ui/toast";
import { ScansUrls } from 'AppUrls';

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
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: projects } = useProjectsQuery({ isTemplate: false, status: "active" });

    const handleTargetChange = (e) => {
        setTarget(e.target.value);
    };

    const targetType = target ? detectTargetType(target) : "";

    const onAnalyze = async () => {
        if (!target || !projectId) return;
        setAnalyzing(true);
        try {
            if (targetType === "url") {
                await ensureUrlAsset(projectId, target);
            }
            const resp = await requestScanRunPost({
                target,
                targetType,
                objective,
                projectId
            });
            if (!resp.ok) {
                const body = await resp.json().catch(() => null);
                throw new Error(body?.message || t("The scan could not be started."));
            }
            const run = await resp.json();
            await queryClient.invalidateQueries({ queryKey: ["scans"] });
            // The scan lives on the server from here on: follow it on its own page.
            navigate(`${ScansUrls.Runs}/${run.id}`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || t("The scan could not be started."));
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="content">
            <FormField layout="horizontal"
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

            <FormField layout="horizontal"
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

            <FormField layout="horizontal"
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
        </div>
    );
};

export default ScanTargetForm;
