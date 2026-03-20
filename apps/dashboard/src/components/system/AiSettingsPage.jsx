import { useSystemAiSettingsQuery, useSystemAiSettingsUpdateMutation } from "api/system.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField";
import NativeInput from "components/form/NativeInput";
import PrimaryButton from "components/ui/buttons/Primary";
import Title from "components/ui/Title";
import { actionCompletedToast, errorToast } from "components/ui/toast.jsx";
import Loading from "components/ui/Loading";
import { useEffect, useState } from "react";
import Breadcrumb from "../ui/Breadcrumb";
import NativeSelect from "components/form/NativeSelect";

const defaultFormState = {
    provider: "Ollama",
    maxOutputTokens: "4000",
    ollamaBaseUrl: "http://localhost:11434/",
    ollamaModel: "llama3.2",
    azureOpenAiEndpoint: "",
    azureOpenAiApiKey: "",
    clearAzureOpenAiApiKey: false,
    azureOpenAiDeployment: "",
    openRouterApiKey: "",
    clearOpenRouterApiKey: false,
    openRouterModel: "",
};

const AiSettingsPage = () => {
    const { data, isLoading } = useSystemAiSettingsQuery();
    const updateMutation = useSystemAiSettingsUpdateMutation();
    const [formState, setFormState] = useState(defaultFormState);

    useEffect(() => {
        if (!data) {
            return;
        }

        setFormState({
            provider: data.provider ?? "Ollama",
            maxOutputTokens: String(data.maxOutputTokens ?? 4000),
            ollamaBaseUrl: data.ollamaBaseUrl ?? "http://localhost:11434/",
            ollamaModel: data.ollamaModel ?? "llama3.2",
            azureOpenAiEndpoint: data.azureOpenAiEndpoint ?? "",
            azureOpenAiApiKey: "",
            clearAzureOpenAiApiKey: false,
            azureOpenAiDeployment: data.azureOpenAiDeployment ?? "",
            openRouterApiKey: "",
            clearOpenRouterApiKey: false,
            openRouterModel: data.openRouterModel ?? "",
        });
    }, [data]);

    const updateField = (ev) => {
        const { name, type, checked, value } = ev.target;
        setFormState((currentState) => ({
            ...currentState,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        const payload = {
            provider: formState.provider,
            maxOutputTokens: formState.maxOutputTokens === "" ? null : Number(formState.maxOutputTokens),
            ollamaBaseUrl: formState.ollamaBaseUrl,
            ollamaModel: formState.ollamaModel,
            azureOpenAiEndpoint: formState.azureOpenAiEndpoint,
            azureOpenAiApiKey: formState.azureOpenAiApiKey,
            clearAzureOpenAiApiKey: formState.clearAzureOpenAiApiKey,
            azureOpenAiDeployment: formState.azureOpenAiDeployment,
            openRouterApiKey: formState.openRouterApiKey,
            clearOpenRouterApiKey: formState.clearOpenRouterApiKey,
            openRouterModel: formState.openRouterModel,
        };

        updateMutation
            .mutateAsync(payload)
            .then(() => {
                actionCompletedToast("AI settings saved");
                setFormState((currentState) => ({
                    ...currentState,
                    azureOpenAiApiKey: "",
                    clearAzureOpenAiApiKey: false,
                    openRouterApiKey: "",
                    clearOpenRouterApiKey: false,
                }));
            })
            .catch((error) => {
                errorToast(error.message ?? "Unable to save AI settings");
            });
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
            </div>

            <Title title="AI settings" />

            <form onSubmit={handleSubmit}>
                <HorizontalLabelledField
                    label="Provider"
                    control={
                        <NativeSelect name="provider" value={formState.provider} onChange={updateField}>
                            <option value="Ollama">Ollama</option>
                            <option value="AzureOpenAI">Azure OpenAI</option>
                            <option value="OpenRouter">OpenRouter</option>
                        </NativeSelect>
                    }
                />

                <HorizontalLabelledField
                    label="Max output tokens"
                    control={
                        <NativeInput
                            type="number"
                            min="1"
                            name="maxOutputTokens"
                            value={formState.maxOutputTokens}
                            onChange={updateField}
                        />
                    }
                />

                <hr />

                {formState.provider === "Ollama" && (
                    <>
                        <h2 className="title is-5">Ollama</h2>

                        <HorizontalLabelledField
                            label="Base URL"
                            control={
                                <NativeInput
                                    type="text"
                                    name="ollamaBaseUrl"
                                    value={formState.ollamaBaseUrl}
                                    onChange={updateField}
                                    placeholder="http://localhost:11434/"
                                />
                            }
                        />

                        <HorizontalLabelledField
                            label="Model"
                            control={
                                <NativeInput
                                    type="text"
                                    name="ollamaModel"
                                    value={formState.ollamaModel}
                                    onChange={updateField}
                                    placeholder="llama3.2"
                                />
                            }
                        />
                    </>
                )}

                {formState.provider === "AzureOpenAI" && (
                    <>
                        <h2 className="title is-5">Azure OpenAI</h2>

                        <HorizontalLabelledField
                            label="Endpoint"
                            control={
                                <NativeInput
                                    type="text"
                                    name="azureOpenAiEndpoint"
                                    value={formState.azureOpenAiEndpoint}
                                    onChange={updateField}
                                    placeholder="https://my-openai.openai.azure.com/"
                                />
                            }
                        />

                        <HorizontalLabelledField
                            label="API Key"
                            control={
                                <NativeInput
                                    type="password"
                                    name="azureOpenAiApiKey"
                                    value={formState.azureOpenAiApiKey}
                                    onChange={updateField}
                                    placeholder={data?.hasAzureOpenAiApiKey ? "Leave blank to keep the stored key" : ""}
                                />
                            }
                        />

                        <HorizontalLabelledField
                            label=""
                            control={
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        name="clearAzureOpenAiApiKey"
                                        checked={formState.clearAzureOpenAiApiKey}
                                        onChange={updateField}
                                    />{" "}
                                    Clear stored API key
                                </label>
                            }
                        />

                        <HorizontalLabelledField
                            label="Deployment"
                            control={
                                <NativeInput
                                    type="text"
                                    name="azureOpenAiDeployment"
                                    value={formState.azureOpenAiDeployment}
                                    onChange={updateField}
                                    placeholder="gpt-4o"
                                />
                            }
                        />
                    </>
                )}

                {formState.provider === "OpenRouter" && (
                    <>
                        <h2 className="title is-5">OpenRouter</h2>

                        <HorizontalLabelledField
                            label="API Key"
                            control={
                                <NativeInput
                                    type="password"
                                    name="openRouterApiKey"
                                    value={formState.openRouterApiKey}
                                    onChange={updateField}
                                    placeholder={data?.hasOpenRouterApiKey ? "Leave blank to keep the stored key" : ""}
                                />
                            }
                        />

                        <HorizontalLabelledField
                            label=""
                            control={
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        name="clearOpenRouterApiKey"
                                        checked={formState.clearOpenRouterApiKey}
                                        onChange={updateField}
                                    />{" "}
                                    Clear stored API key
                                </label>
                            }
                        />

                        <HorizontalLabelledField
                            label="Model"
                            control={
                                <NativeInput
                                    type="text"
                                    name="openRouterModel"
                                    value={formState.openRouterModel}
                                    onChange={updateField}
                                    placeholder="meta-llama/llama-3.1-70b-instruct"
                                />
                            }
                        />
                    </>
                )}

                <hr />

                <HorizontalLabelledField control={<PrimaryButton type="submit">Save</PrimaryButton>} />
            </form>
        </div>
    );
};

export default AiSettingsPage;
