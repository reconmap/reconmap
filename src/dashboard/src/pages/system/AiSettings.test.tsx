import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { buildSettingsPayload } from "./AiSettings";

const modelField = {
    key: "model",
    label: "Model",
    type: "model",
    capability: "chat",
    required: true,
    defaultValue: "orcarouter/auto",
    hasValue: false,
};

const orcaRouterProvider = {
    id: "OrcaRouter",
    name: "OrcaRouter Cyber Inference",
    fields: [
        { key: "apiKey", label: "API key", type: "secret", required: true, hasValue: false },
        modelField,
    ],
};

const otherProvider = {
    id: "OtherRouter",
    name: "Other Router",
    fields: [
        { key: "apiKey", label: "API key", type: "secret", required: true, hasValue: false },
        { ...modelField, defaultValue: "other/default" },
    ],
};

const textProvider = {
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
};

const state = vi.hoisted(() => ({
    data: null as any,
    models: null as any,
}));

vi.mock("api/system.js", () => ({
    useSystemAiSettingsQuery: () => ({ isLoading: false, data: state.data }),
    useSystemAiSettingsUpdateMutation: () => ({ mutateAsync: vi.fn() }),
    useSystemAiProviderModelsQuery: (providerId: string, capability?: string) =>
        state.models(providerId, capability),
}));

import AiSettingsPage from "./AiSettings";

const catalogFor = (providerId: string, ids: string[]) => ({
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: vi.fn(),
    data: {
        providerId,
        capability: "chat",
        source: "live",
        degraded: false,
        message: null,
        models: ids.map((id) => ({
            id,
            name: id === "orca/orcacyber-ultra-1.0" ? "OrcaCyber Ultra" : null,
            contextWindow: null,
            inputModalities: ["text"],
            reasoningEfforts: [],
        })),
    },
});

const renderPage = () =>
    render(
        <MemoryRouter>
            <AiSettingsPage />
        </MemoryRouter>,
    );

beforeEach(() => {
    state.data = {
        provider: "ConfiguredProvider",
        maxOutputTokens: 4000,
        providers: [textProvider],
        values: { ConfiguredProvider: { customModel: "" } },
    };
    state.models = vi.fn((providerId: string) => catalogFor(providerId, ["orcarouter/auto"]));
});

it("renders providers and fields supplied by the API", () => {
    renderPage();

    expect(screen.getByRole("option", { name: "Configured provider" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("model/from-config")).toBeInTheDocument();
    expect(state.models).not.toHaveBeenCalled();
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

it("renders a catalog-backed dropdown for model fields instead of a free-text input", async () => {
    state.data = {
        provider: "OrcaRouter",
        maxOutputTokens: 4000,
        providers: [orcaRouterProvider],
        values: { OrcaRouter: { model: "orcarouter/auto" } },
    };
    state.models = vi.fn((providerId: string) =>
        catalogFor(providerId, ["orcarouter/auto", "orca/orcacyber-ultra-1.0"]),
    );

    const { container } = renderPage();

    expect(state.models).toHaveBeenCalledWith("OrcaRouter", "chat");
    expect(screen.getByRole("combobox", { name: "Model" })).toBeInTheDocument();
    // The model control is a picker, not a free-text input named "model".
    expect(container.querySelector("input[name='model']")).toBeNull();

    await userEvent.click(screen.getByRole("combobox", { name: "Model" }));

    expect(screen.getByRole("button", { name: "orcarouter/auto" })).toBeInTheDocument();
    expect(
        screen.getByRole("button", { name: "OrcaCyber Ultra (orca/orcacyber-ultra-1.0)" }),
    ).toBeInTheDocument();
});

it("re-queries the model catalog when the provider changes", async () => {
    state.data = {
        provider: "OrcaRouter",
        maxOutputTokens: 4000,
        providers: [orcaRouterProvider, otherProvider],
        values: { OrcaRouter: { model: "orcarouter/auto" }, OtherRouter: { model: "other/default" } },
    };
    state.models = vi.fn((providerId: string) => catalogFor(providerId, ["orcarouter/auto"]));

    renderPage();
    expect(state.models).toHaveBeenLastCalledWith("OrcaRouter", "chat");

    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], "OtherRouter");

    expect(state.models).toHaveBeenLastCalledWith("OtherRouter", "chat");
});
