import { useOrganisationsQuery } from "api/clients.js";
import { useProjectCategoriesQuery } from "api/projects.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField";
import NativeCheckbox from "components/form/NativeCheckbox";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import ProjectVulnerabilityMetrics from "models/ProjectVulnerabilityMetrics";
import Loading from "../ui/Loading";
import PrimaryButton from "../ui/buttons/Primary";

const notEmpty = (value) => {
    return value !== null && value !== undefined && value !== "";
};

const convertValue = (value) => {
    if (value === "(null)") return null;
    return value;
};

const ProjectForm = ({ isEdit = false, project, projectSetter: setProject, onFormSubmit }) => {
    const { data: clients, isLoading: isLoadingClients } = useOrganisationsQuery({ kind: "client" });
    const { data: serviceProviders } = useOrganisationsQuery({ kind: "service_provider" });
    const { data: categories, isLoading: isLoadingCategories } = useProjectCategoriesQuery();

    const handleFormChange = (ev) => {
        const value = ev.target.type === "checkbox" ? ev.target.checked : convertValue(ev.target.value);
        setProject({ ...project, [ev.target.name]: value });
    };

    if (!project || isLoadingClients || isLoadingCategories || !serviceProviders) return <Loading />;

    return (
        <form onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>

                <HorizontalLabelledField
                    control={
                        <NativeCheckbox
                            id="isTemplate"
                            name="isTemplate"
                            onChange={handleFormChange}
                            checked={project.isTemplate}
                        >
                            Project template
                        </NativeCheckbox>
                    }
                />

                <HorizontalLabelledField
                    label="Category"
                    htmlFor="categoryId"
                    control={
                        <NativeSelect
                            id="categoryId"
                            name="categoryId"
                            onChange={handleFormChange}
                            value={project.categoryId || ""}
                        >
                            <option value="">(none)</option>
                            {categories.map((category) => (
                                <option key={`category_${category.id}`} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />


                <HorizontalLabelledField
                    label="Name"
                    htmlFor="name"
                    control={
                        <NativeInput
                            id="name"
                            name="name"
                            type="text"
                            onChange={handleFormChange}
                            value={project.name || ""}
                            required
                            autoFocus
                        />
                    }
                />

                {!project.is_template && (
                    <>
                        <HorizontalLabelledField
                            label="Visibility"
                            htmlFor="visibility"
                            control={
                                <NativeSelect
                                    id="visibility"
                                    name="visibility"
                                    onChange={handleFormChange}
                                    value={project.visibility}
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </NativeSelect>
                            }
                        />

                        <HorizontalLabelledField
                            label="Service provider"
                            htmlFor="serviceProviderId"
                            control={
                                <NativeSelect
                                    id="serviceProviderId"
                                    name="serviceProviderId"
                                    onChange={handleFormChange}
                                    value={project.serviceProviderId || ""}
                                >
                                    <option value="">(none)</option>
                                    {serviceProviders &&
                                        serviceProviders.map((provider, index) => (
                                            <option key={index} value={provider.id}>
                                                {provider.name}
                                            </option>
                                        ))}
                                </NativeSelect>
                            }
                        />

                        <HorizontalLabelledField
                            label="Client"
                            htmlFor="clientId"
                            control={
                                <NativeSelect
                                    id="clientId"
                                    name="clientId"
                                    onChange={handleFormChange}
                                    value={project.clientId || ""}
                                >
                                    <option value="">(none)</option>
                                    {clients &&
                                        clients.map((client, index) => (
                                            <option key={index} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                </NativeSelect>
                            }
                        />

                        <HorizontalLabelledField
                            label="External ID"
                            htmlFor="externalId"
                            control={
                                <NativeInput
                                    id="externalId"
                                    name="externalId"
                                    type="text"
                                    onChange={handleFormChange}
                                    value={project.externalId || ""}
                                />
                            }
                        />
                    </>
                )}

                <label>
                    Description
                    <MarkdownEditor
                        name="description"
                        onChange={handleFormChange}
                        value={project.description || ""}
                        required
                    />
                </label>
            </fieldset>

            <fieldset>
                <legend>Rules of engagement</legend>

                <HorizontalLabelledField
                    label="Vulnerability metrics"
                    control={
                        <NativeSelect
                            id="vulnerabilityMetrics"
                            name="vulnerabilityMetrics"
                            value={notEmpty(project.vulnerabilityMetrics) ? project.vulnerabilityMetrics : "(null)"}
                            onChange={handleFormChange}
                        >
                            <option value="(null)">(undefined)</option>
                            {ProjectVulnerabilityMetrics.map((type) => (
                                <option key={`metrics_${type.id}`} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />
                {!project.isTemplate && (
                    <>
                        <HorizontalLabelledField
                            label="Start date"
                            htmlFor="engagementStartDate"
                            control={
                                <NativeInput
                                    id="engagementStartDate"
                                    name="engagementStartDate"
                                    type="date"
                                    value={project.engagementStartDate}
                                    onChange={handleFormChange}
                                />
                            }
                        />
                        <HorizontalLabelledField
                            label="End date"
                            htmlFor="engagementEndDate"
                            control={
                                <NativeInput
                                    id="engagementEndDate"
                                    name="engagementEndDate"
                                    type="date"
                                    value={project.engagementEndDate}
                                    onChange={handleFormChange}
                                />
                            }
                        />{" "}
                    </>
                )}
            </fieldset>

            <PrimaryButton type="submit">{isEdit ? "Update" : "Create"}</PrimaryButton>
        </form>
    );
};

export default ProjectForm;
