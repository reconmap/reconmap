import { useCommandsOutputParsersQuery } from "api/commands.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import LabelledField from "components/form/LabelledField";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../ui/buttons/Primary";

const CommandUsageForm = ({ isEditForm = false, onFormSubmit, commandUsage, commandSetter: setCommand }) => {
    const [t] = useTranslation();

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        let value = target.value;
        if ("tags" === name) {
            value = JSON.stringify(value.split(","));
        }

        setCommand({ ...commandUsage, [name]: value });
    };

    const { data: parsers, isLoading: isLoadingParsers } = useCommandsOutputParsersQuery();

    return (
        <form onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>
                <label>
                    Name
                    <NativeInput
                        type="text"
                        name="name"
                        onChange={onFormChange}
                        value={commandUsage.name || ""}
                        required
                        autoFocus
                    />
                </label>
                <label>
                    Description
                    <MarkdownEditor
                        name="description"
                        onChange={onFormChange}
                        value={commandUsage.description || ""}
                        required
                    />
                </label>
                <label>
                    Tags
                    <NativeInput
                        type="text"
                        name="tags"
                        onChange={onFormChange}
                        value={commandUsage.tags ? JSON.parse(commandUsage.tags).join(",") : ""}
                    />
                </label>
                <label>
                    More information URL
                    <NativeInput
                        type="url"
                        name="moreInfoUrl"
                        onChange={onFormChange}
                        value={commandUsage.moreInfoUrl || ""}
                    />
                </label>
            </fieldset>

            <fieldset>
                <legend>Automation details</legend>

                <label>
                    Executable path
                    <NativeInput
                        type="text"
                        name="executablePath"
                        onChange={onFormChange}
                        value={commandUsage.executablePath || ""}
                    />
                </label>

                <LabelledField
                    label={t("Command line arguments")}
                    control={
                        <NativeInput
                            type="text"
                            name="arguments"
                            onChange={onFormChange}
                            value={commandUsage.arguments || ""}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Output capturing mode"
                    htmlFor="outputCapturingMode"
                    control={
                        <NativeSelect
                            id="outputCapturingMode"
                            name="outputCapturingMode"
                            onChange={onFormChange}
                            value={commandUsage.outputCapturingMode || "none"}
                            required
                        >
                            <option value="none">None</option>
                            <option value="stdout">Standard output</option>
                            <option value="file">File</option>
                        </NativeSelect>
                    }
                />

                {commandUsage.outputCapturingMode === "file" && (
                    <HorizontalLabelledField
                        label="Output filename"
                        htmlFor="outputFilename"
                        control={
                            <NativeInput
                                id="outputFilename"
                                type="text"
                                name="outputFilename"
                                onChange={onFormChange}
                                value={commandUsage.outputFilename || ""}
                            />
                        }
                    />
                )}

                {commandUsage.outputCapturingMode !== "none" && (
                    <HorizontalLabelledField
                        label="Output parser"
                        htmlFor="outputParser"
                        control={
                            <NativeSelect
                                id="outputParser"
                                name="outputParser"
                                onChange={onFormChange}
                                value={commandUsage.outputParser || ""}
                            >
                                <option value="">(none)</option>
                                {!isLoadingParsers &&
                                    parsers.map((parser) => (
                                        <option key={`parser_${parser.code}`} value={parser.code}>
                                            {parser.name}
                                        </option>
                                    ))}
                            </NativeSelect>
                        }
                    />
                )}
            </fieldset>

            <PrimaryButton type="submit">{isEditForm ? "Save" : "Add"}</PrimaryButton>
        </form>
    );
};

export default CommandUsageForm;
