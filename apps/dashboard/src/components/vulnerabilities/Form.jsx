import { useAssetsQuery } from "api/assets.js";
import { useProjectsQuery } from "api/projects.js";
import { useSystemCustomFieldsQuery } from "api/system.js";
import { useVulnerabilityCategoriesQuery } from "api/vulnerabilities.js";
import DynamicForm from "components/form/DynamicForm";
import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import NativeCheckbox from "components/form/NativeCheckbox";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import Tooltip from "components/ui/Tooltip.jsx";
import RemediationComplexity from "models/RemediationComplexity";
import RemediationPriority from "models/RemediationPriority";
import { useState } from "react";
import Risks from "../../models/Risks";
import Primary from "../ui/buttons/Primary";
import CvssAbbr from "./CvssAbbr";
import OwaspRR from "./OwaspRR";

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
    const [selectedProject, setSelectedProject] = useState(null);
    const { data: customFields } = useSystemCustomFieldsQuery();

    const { data: projects, isLoading: isLoadingProjects } = useProjectsQuery({});
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

        const project = projects.data.find((proj) => proj.id === parseInt(value));
        setSelectedProject(project);

        setVulnerability({ ...vulnerability, [name]: value, targetId: 0 });
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
                {!vulnerability.is_template && (
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
                {"CVSS" === selectedProject?.vulnerability_metrics && (
                    <>
                        <label>
                            CVSS score
                            <NativeInput
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                name="cvss_score"
                                value={vulnerability.cvss_score || ""}
                                onChange={onFormChange}
                            />
                        </label>
                        <label>
                            <span>
                                <CvssAbbr /> vector
                            </span>
                            <NativeInput
                                type="text"
                                name="cvss_vector"
                                value={vulnerability.cvss_vector || ""}
                                onChange={onFormChange}
                                placeholder="eg: AV:N/AC:L/Au:S/C:P/I:P/A:N"
                            />
                        </label>
                    </>
                )}
            </fieldset>

            {"OWASP_RR" === selectedProject?.vulnerability_metrics && (
                <div>
                    <h2>
                        <div>Owasp Risk Rating calculator</div>
                    </h2>
                    <label>Owasp Risk Rating</label>
                    <OwaspRR vulnerability={vulnerability} vulnerabilitySetter={setVulnerability} />
                </div>
            )}

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
        </form>
    );
};

export default VulnerabilityForm;
