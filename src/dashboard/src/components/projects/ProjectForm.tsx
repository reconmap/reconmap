import { useOrganisationsQuery } from "api/clients";
import { useProjectCategoriesQuery } from "api/projects";
import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import Loading from "../ui/Loading";
import PrimaryButton from "../ui/buttons/PrimaryButton";

const convertValue = (value) => {
    if (value === "(null)") return null;
    return value;
};

const ProjectForm = ({ project, projectSetter: setProject, onFormSubmit }: any) => {
    const { data: clients, isLoading: isLoadingClients } = useOrganisationsQuery({ kind: "client" });
    const { data: serviceProviders } = useOrganisationsQuery({ kind: "service_provider" });
    const { data: categories, isLoading: isLoadingCategories } = useProjectCategoriesQuery();

    const handleFormChange = (ev) => {
        const value = ev.target.type === "checkbox" ? ev.target.checked : convertValue(ev.target.value);
        setProject({ ...project, [ev.target.name]: value });
    };

    if (!project || isLoadingClients || isLoadingCategories || !serviceProviders) return <Loading />;

    return (
        <Form layout="horizontal" onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>

                <FormField
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

                <FormField
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


                <FormField
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

                {!project.isTemplate && (
                    <>
                        <FormField
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

                        <FormField
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

                        <FormField
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

                <FormField
                    htmlFor="projectDescription"
                    label="Description"
                    control={
                        <MarkdownEditor
                            id="projectDescription"
                            name="description"
                            onChange={handleFormChange}
                            value={project.description || ""}
                            required
                        />
                    }
                />
            </fieldset>

            {!project.isTemplate && (
                <fieldset>
                    <legend>Rules of engagement</legend>
                    <>
                        <FormField
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
                        <FormField
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
                </fieldset>
            )}

            <PrimaryButton type="submit">Save</PrimaryButton>
        </Form>
    );
};

export default ProjectForm;
