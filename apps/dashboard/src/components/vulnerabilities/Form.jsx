import { useAssetsQuery } from "api/assets.js";
import { useProjectsQuery } from "api/projects.js";
import { useSystemCustomFieldsQuery } from "api/system.js";
import { useVulnerabilityCategoriesQuery } from "api/vulnerabilities.js";
import DynamicForm from "components/forms/DynamicForm";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField.jsx";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import Tooltip from "components/ui/Tooltip.jsx";
import RemediationComplexity from "models/RemediationComplexity";
import RemediationPriority from "models/RemediationPriority";
import { useState, useEffect, useRef } from "react";
import Risks from "../../models/Risks";
import Primary from "../ui/buttons/Primary";
import CvssAbbr from "./CvssAbbr";
import CvssCalculator from "./CvssCalculator";

const TargetsSelectControl = ({ projectId, value, onFormChange }) => {
    const { data: targets, isLoading } = useAssetsQuery({ projectId });

    return (
        <NativeSelect name="targetId" value={value} onChange={onFormChange}>
            <option value="0">(none)</option>
            {!isLoading &&
                targets.data.map((target, index) => (
                    <option key={index} value={target.id}>
                        {target.name}
                    </option>
                ))}
        </NativeSelect>
    );
};

const tryParseTags = (tags) => {
    if (!tags) return "";
    try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) {
            return parsed.join(", ");
        }
    } catch (e) {
        console.error("Failed to parse tags:", e);
    }
    return tags;
};

const VulnerabilityForm = ({
    isEditForm = false,
    vulnerability,
    vulnerabilitySetter: setVulnerability,
    onFormSubmit,
}) => {
    const { data: customFields } = useSystemCustomFieldsQuery();

    const cvssDialogRef = useRef(null);

    const { data: projects, isLoading: isLoadingProjects } = useProjectsQuery({});

    useEffect(() => {
        if (projects?.data?.length > 0 && !vulnerability.isTemplate) {
            let targetProjectId = parseInt(vulnerability.projectId);
            if (!targetProjectId || targetProjectId === 0) {
                targetProjectId = projects.data[0].id;
                setVulnerability(v => ({
                    ...v,
                    projectId: targetProjectId,
                    targetId: 0,
                }));
            }
        }
    }, [projects, vulnerability?.projectId, vulnerability?.isTemplate]);
    const { data: categories, isLoading: isLoadingVulnerabilityCategories } = useVulnerabilityCategoriesQuery({
        parentsOnly: false,
    });

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        let value = target.type === "checkbox" ? target.checked : target.value;

        if ("categoryId" === name) {
            if (value !== "(none)") {
                setVulnerability({
                    ...vulnerability,
                    [name]: value,
                });
            } else {
                setVulnerability({ ...vulnerability, categoryId: null });
            }
        } else {
            setVulnerability({ ...vulnerability, [name]: value });
        }
    };

    const onProjectChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        let value = target.value;

        setVulnerability({
            ...vulnerability,
            [name]: value,
            targetId: 0,
        });
    };

    return (
        <form id="vulnerabilityCreateForm" onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>
                <label>
                    Properties
                    <div>
                        <NativeCheckbox name="isTemplate" onChange={onFormChange} checked={vulnerability.isTemplate}>
                            Is template
                        </NativeCheckbox>
                    </div>
                </label>
                <HorizontalLabelledField
                    label={
                        <>
                            ID{" "}
                            <Tooltip
                                text="(Optional) Used to store an internal or external identifier"
                                position="top"
                            />
                        </>
                    }
                    htmlFor="externalId"
                    control={
                        <NativeInput
                            id="externalId"
                            name="externalId"
                            type="text"
                            value={vulnerability.externalId || ""}
                            onChange={onFormChange}
                        />
                    }
                />



                <HorizontalLabelledField
                    label="Summary"
                    htmlFor="summary"
                    control={
                        <NativeInput
                            id="summary"
                            name="summary"
                            type="text"
                            value={vulnerability.summary || ""}
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Description"
                    htmlFor="description"
                    control={
                        <MarkdownEditor
                            id="description"
                            name="description"
                            value={vulnerability.description || ""}
                            onChange={onFormChange}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Category"
                    htmlFor="categoryId"
                    control={
                        <NativeSelect
                            id="categoryId"
                            name="categoryId"
                            value={vulnerability.categoryId || ""}
                            onChange={onFormChange}
                            required
                        >
                            <option>(none)</option>
                            {categories &&
                                categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                        </NativeSelect>
                    }
                />

                <HorizontalLabelledField
                    label={
                        <>
                            Visibility <Tooltip text="Private makes this vulnerability not visible to the client." />
                        </>
                    }
                    htmlFor="visibility"
                    control={
                        <>
                            {" "}
                            <NativeSelect
                                id="visibility"
                                name="visibility"
                                value={vulnerability.visibility || ""}
                                onChange={onFormChange}
                                required
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </NativeSelect>
                        </>
                    }
                />

                <HorizontalLabelledField
                    label="Risk"
                    htmlFor="risk"
                    control={
                        <NativeSelect
                            id="risk"
                            name="risk"
                            value={vulnerability.risk || ""}
                            onChange={onFormChange}
                            required
                        >
                            {Risks.map((risk) => (
                                <option key={risk.id} value={risk.id}>
                                    {risk.name}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />

                <HorizontalLabelledField
                    label="Tags"
                    htmlFor="tags"
                    control={
                        <NativeInput
                            id="tags"
                            name="tags"
                            type="text"
                            onChange={onFormChange}
                            value={vulnerability.tags ? tryParseTags(vulnerability.tags) : ""}
                        />
                    }
                />
                {!vulnerability.isTemplate && (
                    <fieldset>
                        <legend>Relations</legend>
                        <HorizontalLabelledField
                            label="Project"
                            htmlFor="projectId"
                            control={
                                <NativeSelect
                                    id="projectId"
                                    name="projectId"
                                    value={vulnerability.projectId || ""}
                                    onChange={onProjectChange}
                                    required
                                >
                                    {!isLoadingProjects && (
                                        <>
                                            {projects.data &&
                                                projects.data.map((project, index) => (
                                                    <option key={index} value={project.id}>
                                                        {project.name}
                                                    </option>
                                                ))}
                                        </>
                                    )}
                                </NativeSelect>
                            }
                        />

                        <HorizontalLabelledField
                            label="Affected asset"
                            htmlFor="targetId"
                            control={
                                <TargetsSelectControl
                                    projectId={vulnerability.projectId}
                                    value={vulnerability.targetId}
                                    onFormChange={onFormChange}
                                />
                            }
                        />
                    </fieldset>
                )}

                <label>
                    External references
                    <MarkdownEditor
                        name="external_refs"
                        value={vulnerability.external_refs || ""}
                        onChange={onFormChange}
                    />
                </label>

                <label>
                    Proof of concept
                    <MarkdownEditor
                        name="proof_of_concept"
                        value={vulnerability.proof_of_concept || ""}
                        onChange={onFormChange}
                    />
                </label>
                <label>
                    Impact
                    <MarkdownEditor name="impact" value={vulnerability.impact || ""} onChange={onFormChange} />
                </label>
                <HorizontalLabelledField
                    label="CVSS score"
                    htmlFor="cvssScore"
                    control={
                        <NativeInput
                            id="cvssScore"
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            name="cvssScore"
                            value={vulnerability.cvssScore || ""}
                            onChange={onFormChange}
                        />
                    }
                />
                <HorizontalLabelledField
                    label={
                        <span>
                            <CvssAbbr /> vector
                        </span>
                    }
                    htmlFor="cvssVector"
                    control={
                        <div className="field has-addons" style={{ width: "100%" }}>
                            <div className="control is-expanded">
                                <NativeInput
                                    id="cvssVector"
                                    type="text"
                                    name="cvssVector"
                                    value={vulnerability.cvssVector || ""}
                                    onChange={onFormChange}
                                    placeholder="eg: CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
                                />
                            </div>
                            <div className="control">
                                <button
                                    type="button"
                                    className="button is-info"
                                    style={{ background: "linear-gradient(135deg, var(--blue), #00d1b2)", color: "white", border: "none" }}
                                    onClick={() => cvssDialogRef.current?.showModal()}
                                >
                                    Calculate
                                </button>
                            </div>
                        </div>
                    }
                />
            </fieldset>

            <fieldset>
                <legend>Remediation</legend>

                <HorizontalLabelledField
                    label="Remediation instructions"
                    control={
                        <MarkdownEditor
                            name="remediation"
                            value={vulnerability.remediation || ""}
                            onChange={onFormChange}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Remediation complexity"
                    control={
                        <NativeSelect
                            name="remediation_complexity"
                            value={vulnerability.remediation_complexity || ""}
                            onChange={onFormChange}
                            required
                        >
                            {RemediationComplexity.map((complexity) => (
                                <option key={complexity.id} value={complexity.id}>
                                    {complexity.name}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />

                <HorizontalLabelledField
                    label="Remediation priority"
                    control={
                        <NativeSelect
                            name="remediation_priority"
                            value={vulnerability.remediation_priority || ""}
                            onChange={onFormChange}
                            required
                        >
                            {RemediationPriority.map((priority) => (
                                <option key={priority.id} value={priority.id}>
                                    {priority.name}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />
            </fieldset>

            {customFields && <DynamicForm fields={customFields} />}

            <Primary type="submit">{isEditForm ? "Save" : "Add"}</Primary>

            {/* CVSS Dialog */}
            <dialog
                ref={cvssDialogRef}
                style={{
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    padding: "24px",
                    width: "90%",
                    maxWidth: "600px",
                    background: "#252535",
                    color: "white",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
                    <h3 className="title is-5" style={{ color: "white", margin: 0 }}>CVSS Calculator</h3>
                    <button
                        type="button"
                        onClick={() => cvssDialogRef.current?.close()}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "white",
                            fontSize: "24px",
                            cursor: "pointer",
                        }}
                    >
                        &times;
                    </button>
                </div>
                <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "12px 0" }}>
                    <CvssCalculator vulnerability={vulnerability} vulnerabilitySetter={setVulnerability} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px", marginTop: "12px" }}>
                    <button
                        type="button"
                        className="button is-primary"
                        onClick={() => cvssDialogRef.current?.close()}
                    >
                        Done
                    </button>
                </div>
            </dialog>
        </form>
    );
};

export default VulnerabilityForm;
