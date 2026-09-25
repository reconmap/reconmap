import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { buildSettingsPayload } from "./AiSettings";

const { aiSettingsData } = vi.hoisted(() => ({
    aiSettingsData: {
        provider: "ConfiguredProvider",
        maxOutputTokens: 4000,
        providers: [
            {
                id: "ConfiguredProvider",
                name: "Configured provider",
                fields: [
                    {
                        key: "customModel",
                        label: "Custom model",
                        type: "text",
                        required: true,
                        placeholder: "model/from-config",
                        defaultValue: null,
                        hasValue: false,
                    },
                ],
            },
        ],
        values: { ConfiguredProvider: { customModel: "" } },
    },
}));

vi.mock("api/system.js", () => ({
    useSystemAiSettingsQuery: () => ({
        isLoading: false,
        data: aiSettingsData,
    }),
    useSystemAiSettingsUpdateMutation: () => ({ mutateAsync: vi.fn() }),
}));

import AiSettingsPage from "./AiSettings";

it("renders providers and fields supplied by the API", async () => {
    render(
        <MemoryRouter>
            <AiSettingsPage />
        </MemoryRouter>,
    );

    expect(screen.getByRole("option", { name: "Configured provider" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("model/from-config")).toBeInTheDocument();
});

it("builds generic settings while preserving blank secrets unless explicitly cleared", () => {
    const provider = {
        fields: [
            { key: "apiKey", type: "secret" },
            { key: "model", type: "text" },
        ],
    };

    expect(buildSettingsPayload(provider, { apiKey: "", model: "vendor/model" }, {})).toEqual({
        model: "vendor/model",
    });
    expect(buildSettingsPayload(provider, { apiKey: "", model: "vendor/model" }, { apiKey: true })).toEqual({
        apiKey: null,
        model: "vendor/model",
    });
});
