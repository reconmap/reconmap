import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "translations/i18n";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("api/system.js", () => ({
    useSystemAiProviderModelsQuery: (providerId: string, capability?: string) =>
        queryMock(providerId, capability),
}));

import AiModelSelect from "./AiModelSelect";

const field = { key: "model", label: "Model", capability: "chat", required: true };

const liveCatalog = (ids: string[]) => ({
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: vi.fn(),
    data: {
        providerId: "OrcaRouter",
        capability: "chat",
        source: "live",
        degraded: false,
        message: null,
        models: ids.map((id) => ({
            id,
            name: null,
            contextWindow: null,
            inputModalities: ["text"],
            reasoningEfforts: [],
        })),
    },
});

it("renders options from the live provider catalog", async () => {
    queryMock.mockReturnValue(liveCatalog(["orcarouter/auto", "orca/orcacyber-ultra-1.0"]));
    const onChange = vi.fn();

    render(
        <AiModelSelect
            providerId="OrcaRouter"
            field={field}
            value="orcarouter/auto"
            onChange={onChange}
        />,
    );

    expect(queryMock).toHaveBeenCalledWith("OrcaRouter", "chat");
    expect(screen.getByRole("combobox", { name: "Model" })).toHaveValue("orcarouter/auto");
    expect(screen.getByText("Live catalog: 2 models")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("combobox", { name: "Model" }));

    expect(screen.getByRole("button", { name: "orcarouter/auto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "orca/orcacyber-ultra-1.0" })).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
});

it("clears a stored model that the catalog no longer offers", () => {
    queryMock.mockReturnValue(liveCatalog(["orcarouter/auto"]));
    const onChange = vi.fn();

    render(
        <AiModelSelect
            providerId="OrcaRouter"
            field={field}
            value="retired/model"
            onChange={onChange}
        />,
    );

    expect(onChange).toHaveBeenCalledWith("");
    expect(
        screen.getByText("The previously selected model is no longer available. Select a model."),
    ).toBeInTheDocument();
});

it("labels a verified fallback catalog instead of pretending it is live", () => {
    queryMock.mockReturnValue({
        ...liveCatalog(["orcarouter/auto", "deepseek/deepseek-v4-pro"]),
        data: {
            providerId: "OrcaRouter",
            capability: "chat",
            source: "verified-fallback",
            degraded: true,
            message: "Live model discovery failed (HTTP 401). Showing verified fallback models.",
            models: [
                {
                    id: "orcarouter/auto",
                    name: "OrcaRouter Auto",
                    contextWindow: null,
                    inputModalities: ["text"],
                    reasoningEfforts: [],
                },
            ],
        },
    });

    render(
        <AiModelSelect providerId="OrcaRouter" field={field} value="orcarouter/auto" onChange={vi.fn()} />,
    );

    expect(
        screen.getByText("Live discovery unavailable — showing the verified fallback catalog."),
    ).toBeInTheDocument();
});

it("shows an actionable error and never falls back to free text", () => {
    queryMock.mockReturnValue({
        isLoading: false,
        isError: true,
        error: new Error("OrcaRouter Cyber Inference API key is not configured."),
        isFetching: false,
        refetch: vi.fn(),
        data: undefined,
    });

    const { container } = render(
        <AiModelSelect providerId="OrcaRouter" field={field} value="" onChange={vi.fn()} />,
    );

    expect(screen.getByText(/API key is not configured/)).toBeInTheDocument();
    expect(container.querySelector("input[type='password']")).toBeNull();
    expect(screen.getByRole("combobox", { name: "Model" })).toBeDisabled();
});

it("selects a model from the opened dropdown", async () => {
    queryMock.mockReturnValue(liveCatalog(["orcarouter/auto", "orca/orcacyber-zero-1.5"]));
    const onChange = vi.fn();

    render(
        <AiModelSelect providerId="OrcaRouter" field={field} value="orcarouter/auto" onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: "Model" }));
    await userEvent.click(screen.getByRole("button", { name: "orca/orcacyber-zero-1.5" }));

    expect(onChange).toHaveBeenCalledWith("orca/orcacyber-zero-1.5");
    expect(screen.queryByRole("button", { name: "orca/orcacyber-zero-1.5" })).not.toBeInTheDocument();
});

it("filters the dropdown by search text", async () => {
    queryMock.mockReturnValue(liveCatalog(["orcarouter/auto", "orca/orcacyber-zero-1.5"]));

    render(
        <AiModelSelect providerId="OrcaRouter" field={field} value="orcarouter/auto" onChange={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: "Model" }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Search models" }), "zero");

    expect(screen.getByRole("button", { name: "orca/orcacyber-zero-1.5" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "orcarouter/auto" })).not.toBeInTheDocument();
});
