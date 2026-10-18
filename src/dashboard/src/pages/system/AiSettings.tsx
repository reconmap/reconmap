import { useSystemAiSettingsQuery, useSystemAiSettingsUpdateMutation } from "api/system";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeInput from "components/forms/NativeInput";
import PrimaryButton from "components/ui/buttons/Primary";
import Title from "components/ui/Title";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import Loading from "components/ui/Loading";
import { useMemo, useState } from "react";
import Breadcrumb from "components/ui/Breadcrumb";
import NativeSelect from "components/forms/NativeSelect";

export const buildSettingsPayload = (provider, providerValues, clearedSecrets) => {
    const settings = {};

    for (const field of provider.fields) {
        const value = providerValues?.[field.key] ?? "";
        if (field.type === "secret") {
            if (clearedSecrets[field.key]) {
                settings[field.key] = null;
            } else if (value.trim() !== "") {
                settings[field.key] = value;
            }
        } else {
            settings[field.key] = value.trim() === "" ? null : value;
        }
    }

    return settings;
};

const buildAiForm = (data) => {
    const values = {};
    for (const provider of data?.providers ?? []) {
        values[provider.id] = { ...(data.values?.[provider.id] ?? {}) };
        for (const field of provider.fields) {
            values[provider.id][field.key] ??= field.defaultValue ?? "";
            if (field.type === "secret") values[provider.id][field.key] = "";
        }
    }

    return {
        providerId: data?.provider ?? "",
        maxOutputTokens: String(data?.maxOutputTokens ?? 4000),
        values,
        clearedSecrets: {},
    };
};

const AiSettingsPage = () => {
    const { data, isLoading } = useSystemAiSettingsQuery();
    const updateMutation = useSystemAiSettingsUpdateMutation();
    const [edits, setEdits] = useState<any>(null);

    // Until the user edits the form, it shows the saved settings.
    const { providerId, maxOutputTokens, values, clearedSecrets } = edits ?? buildAiForm(data);
    const updateForm = (update) => setEdits((current) => update(current ?? buildAiForm(data)));

    const provider = useMemo(
        () => data?.providers.find((candidate) => candidate.id === providerId),
        [data, providerId],
    );

    const updateSetting = (key, value) => {
        updateForm((form) => ({
            ...form,
            values: {
                ...form.values,
                [providerId]: {
                    ...form.values[providerId],
                    [key]: value,
                },
            },
        }));
    };

    const toggleClearSecret = (key, checked) => {
        updateForm((form) => ({ ...form, clearedSecrets: { ...form.clearedSecrets, [key]: checked } }));
        if (checked) updateSetting(key, "");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!provider) return;

        const payload = {
            provider: provider.id,
            maxOutputTokens: maxOutputTokens === "" ? null : Number(maxOutputTokens),
            settings: buildSettingsPayload(provider, values[provider.id], clearedSecrets),
        };

        try {
            await updateMutation.mutateAsync(payload);
            actionCompletedToast("AI settings saved");
            updateForm((form) => ({
                ...form,
                values: {
                    ...form.values,
                    [provider.id]: {
                        ...form.values[provider.id],
                        ...Object.fromEntries(
                            provider.fields.filter((field) => field.type === "secret").map((field) => [field.key, ""]),
                        ),
                    },
                },
                clearedSecrets: {},
            }));
        } catch (error) {
            errorToast((error as any).message ?? "Unable to save AI settings");
        }
    };

    if (isLoading || !data || !provider) return <Loading />;

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
                        <NativeSelect
                            name="provider"
                            value={providerId}
                            onChange={(event) => {
                                updateForm((form) => ({ ...form, providerId: event.target.value, clearedSecrets: {} }));
                            }}
                        >
                            {data.providers.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />

                <HorizontalLabelledField
                    label="Max output tokens"
                    control={
                        <NativeInput
                            type="number"
                            min="1"
                            required
                            name="maxOutputTokens"
                            value={maxOutputTokens}
                            onChange={(event) => updateForm((form) => ({ ...form, maxOutputTokens: event.target.value }))}
                        />
                    }
                />

                <hr />
                <h2 className="title is-5">{provider.name}</h2>

                {provider.fields.map((field) => {
                    const isSecret = field.type === "secret";
                    const isCleared = clearedSecrets[field.key] ?? false;
                    return (
                        <div key={field.key}>
                            <HorizontalLabelledField
                                label={field.label}
                                control={
                                    <NativeInput
                                        type={isSecret ? "password" : field.type}
                                        name={field.key}
                                        value={values[provider.id]?.[field.key] ?? ""}
                                        onChange={(event) => updateSetting(field.key, event.target.value)}
                                        placeholder={
                                            isSecret && field.hasValue
                                                ? "Leave blank to keep the stored value"
                                                : field.placeholder
                                        }
                                        required={field.required && (!isSecret || (!field.hasValue && !isCleared))}
                                        disabled={isCleared}
                                    />
                                }
                            />

                            {isSecret && field.hasValue && (
                                <HorizontalLabelledField
                                    label=""
                                    control={
                                        <label className="checkbox">
                                            <input
                                                type="checkbox"
                                                checked={isCleared}
                                                onChange={(event) => toggleClearSecret(field.key, event.target.checked)}
                                            />{" "}
                                            Clear stored {field.label.toLowerCase()}
                                        </label>
                                    }
                                />
                            )}
                        </div>
                    );
                })}

                <hr />
                <HorizontalLabelledField control={<PrimaryButton type="submit">Save</PrimaryButton>} />
            </form>
        </div>
    );
};

export default AiSettingsPage;
