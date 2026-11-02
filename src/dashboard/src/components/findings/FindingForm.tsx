import { useAssetsQuery } from "api/assets";
import { assetPath } from "models/assetTree";
import { useProjectsQuery } from "api/projects";
import { useSystemCustomFieldsQuery } from "api/system";
import { useFindingCategoriesQuery } from "api/findings";
import DynamicForm from "components/forms/DynamicForm";
import Form from "components/forms/Form";
import FormActions from "components/forms/FormActions";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import ModalDialog from "components/ui/ModalDialog";
import Tooltip from "components/ui/Tooltip";
import RemediationComplexity from "models/RemediationComplexity";
import RemediationPriority from "models/RemediationPriority";
import { useEffect, useState, type ChangeEvent } from "react";
import Risks from "../../models/Risks";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import CvssAbbr from "./CvssAbbr";
import CvssCalculator from "./CvssCalculator";

const AssetsSelectControl = ({ projectId, value, onFormChange }: any) => {
    const { data: assets } = useAssetsQuery({ projectId });

    return (
        <NativeSelect name="assetId" value={value ?? ""} onChange={onFormChange}>
            <option value="">(none)</option>
            {Array.isArray(assets?.data) &&
                assets.data.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                        {assetPath(assets.data, asset.id)
                            .map((node) => node.name)
                            .join(" › ")}
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

const FindingForm = ({
    finding,
    findingSetter: setFinding,
    onFormSubmit,
}: any) => {
    const { data: customFields } = useSystemCustomFieldsQuery();

    const [cvssDialogVisible, setCvssDialogVisible] = useState(false);

    const { data: projects, isLoading: isLoadingProjects } = useProjectsQuery({});

    useEffect(() => {
        if (projects?.data?.length > 0 && !finding.isTemplate) {
            if (!finding.projectId) {
                setFinding({
                    ...finding,
                    projectId: projects.data[0].id,
                    assetId: null,
                });
            }
        }
    }, [projects, finding, setFinding]);
    const { data: categories } = useFindingCategoriesQuery({
        parentsOnly: false,
    });

    const onFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const name = target.name;
        let value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;

        if ("categoryId" === name) {
            if (value !== "(none)") {
                setFinding({
                    ...finding,
                    [name]: value,
                });
            } else {
                setFinding({ ...finding, categoryId: null });
            }
        } else if ("assetId" === name) {
            setFinding({ ...finding, assetId: value === "" ? null : value });
        } else {
            setFinding({ ...finding, [name]: value });
        }
    };

    const onProjectChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const name = target.name;
        let value = target.value;

        setFinding({
            ...finding,
            [name]: value,
            assetId: null,
        });
    };

    return (
        <Form layout="horizontal" id="findingCreateForm" onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>
                <FormField
                    control={
                        <NativeCheckbox name="isTemplate" onChange={onFormChange} checked={finding.isTemplate}>
                            Template
                        </NativeCheckbox>
                    }
                />
                <FormField
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
                            value={finding.externalId || ""}
                            onChange={onFormChange}
                        />
                    }
                />



                <FormField
                    label="Summary"
                    htmlFor="summary"
                    control={
                        <NativeInput
                            id="summary"
                            name="summary"
                            type="text"
                            value={finding.summary || ""}
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />

                <FormField
                    label="Description"
                    htmlFor="description"
                    control={
                        <MarkdownEditor
                            id="description"
                            name="description"
                            value={finding.description || ""}
                            onChange={onFormChange}
                        />
                    }
                />

                <FormField
                    label="Category"
                    htmlFor="categoryId"
                    control={
                        <NativeSelect
                            id="categoryId"
                            name="categoryId"
                            value={finding.categoryId || ""}
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

                <FormField
                    label={
                        <>
                            Visibility <Tooltip text="Private makes this finding not visible to the client." />
                        </>
                    }
                    htmlFor="visibility"
                    control={
                        <>
                            {" "}
                            <NativeSelect
                                id="visibility"
                                name="visibility"
                                value={finding.visibility || ""}
                                onChange={onFormChange}
                                required
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </NativeSelect>
                        </>
                    }
                />

                <FormField
                    label="Risk"
                    htmlFor="risk"
                    control={
                        <NativeSelect
                            id="risk"
                            name="risk"
                            value={finding.risk || ""}
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

                <FormField
                    label="Tags"
                    htmlFor="tags"
                    control={
                        <NativeInput
                            id="tags"
                            name="tags"
                            type="text"
                            onChange={onFormChange}
                            value={finding.tags ? tryParseTags(finding.tags) : ""}
                        />
                    }
                />
                {!finding.isTemplate && (
                    <fieldset>
                        <legend>Relations</legend>
                        <FormField
                            label="Project"
                            htmlFor="projectId"
                            control={
                                <NativeSelect
                                    id="projectId"
                                    name="projectId"
                                    value={finding.projectId || ""}
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

                        <FormField
                            label="Affected asset"
                            htmlFor="assetId"
                            control={
                                <AssetsSelectControl
                                    projectId={finding.projectId}
                                    value={finding.assetId}
                                    onFormChange={onFormChange}
                                />
                            }
                        />
                    </fieldset>
                )}

                <FormField
                    htmlFor="findingExternalRefs"
                    label="External references"
                    control={
                        <MarkdownEditor
                            id="findingExternalRefs"
                            name="external_refs"
                            value={finding.external_refs || ""}
                            onChange={onFormChange}
                        />
                    }
                />

                <FormField
                    htmlFor="findingProofOfConcept"
                    label="Proof of concept"
                    control={
                        <MarkdownEditor
                            id="findingProofOfConcept"
                            name="proof_of_concept"
                            value={finding.proof_of_concept || ""}
                            onChange={onFormChange}
                        />
                    }
                />
                <FormField
                    htmlFor="findingImpact"
                    label="Impact"
                    control={
                        <MarkdownEditor
                            id="findingImpact"
                            name="impact"
                            value={finding.impact || ""}
                            onChange={onFormChange}
                        />
                    }
                />
                <FormField
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
                            value={finding.cvssScore || ""}
                            onChange={onFormChange}
                        />
                    }
                />
                <FormField
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
                                    value={finding.cvssVector || ""}
                                    onChange={onFormChange}
                                    placeholder="eg: CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
                                />
                            </div>
                            <div className="control">
                                <button
                                    type="button"
                                    className="button is-info"
                                    style={{ background: "linear-gradient(135deg, var(--blue), #00d1b2)", color: "white", border: "none" }}
                                    onClick={() => setCvssDialogVisible(true)}
                                >
                                    Calculate&hellip;
                                </button>
                            </div>
                        </div>
                    }
                />
            </fieldset>

            <fieldset>
                <legend>Remediation</legend>

                <FormField
                    label="Remediation instructions"
                    control={
                        <MarkdownEditor
                            name="remediation"
                            value={finding.remediation || ""}
                            onChange={onFormChange}
                        />
                    }
                />

                <FormField
                    label="Remediation complexity"
                    control={
                        <NativeSelect
                            name="remediation_complexity"
                            value={finding.remediation_complexity || ""}
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

                <FormField
                    label="Remediation priority"
                    control={
                        <NativeSelect
                            name="remediation_priority"
                            value={finding.remediation_priority || ""}
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

            <FormActions>
                <PrimaryButton type="submit">Save</PrimaryButton>
            </FormActions>

            <ModalDialog visible={cvssDialogVisible} onModalClose={() => setCvssDialogVisible(false)} 
                title="CVSS Calculator"
                footer={
                    <PrimaryButton type="button" onClick={() => setCvssDialogVisible(false)}>
                        Done
                    </PrimaryButton>
                }
            >
                <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "12px 0" }}>
                    <CvssCalculator finding={finding} findingSetter={setFinding} />
                </div>
            </ModalDialog>
        </Form>
    );
};

export default FindingForm;
