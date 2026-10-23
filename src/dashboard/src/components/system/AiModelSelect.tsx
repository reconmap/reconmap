import { useSystemAiProviderModelsQuery } from "api/system";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import styles from "./AiModelSelect.module.css";

interface AiModelField {
    key: string;
    label: string;
    capability?: string;
    required?: boolean;
}

interface AiModelSelectProps {
    providerId: string;
    field: AiModelField;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const modelLabel = (model: { id: string; name: string | null }) =>
    model.name && model.name !== model.id ? `${model.name} (${model.id})` : model.id;

/**
 * Model picker backed by the provider's live catalog. The API key stays on the server; this
 * component only ever receives model metadata. When live discovery fails the server returns a
 * verified fallback list, so the control never degrades into free text.
 */
const AiModelSelect = ({ providerId, field, value, onChange, disabled = false }: AiModelSelectProps) => {
    const [t] = useTranslation();
    const { data, isLoading, isError, error, isFetching, refetch } = useSystemAiProviderModelsQuery(
        providerId,
        field.capability,
    );
    const [replacedModel, setReplacedModel] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listId = useId();

    const models = data?.models ?? [];
    const loweredQuery = query.trim().toLowerCase();
    const filtered = models.filter((model) => {
        if (loweredQuery === "") return true;
        return (
            model.id.toLowerCase().includes(loweredQuery) ||
            (model.name ?? "").toLowerCase().includes(loweredQuery)
        );
    });
    const selected = models.find((model) => model.id === value);

    // A stored model that the catalog no longer offers must not be submitted silently.
    useEffect(() => {
        if (!data || isLoading || value === "") return;
        if (!data.models.some((model) => model.id === value)) {
            // The live catalog is external data, so this can only be detected after it arrives.
            // oxlint-disable-next-line react/set-state-in-effect
            setReplacedModel(value);
            onChange("");
        }
    }, [data, isLoading, value, onChange]);

    useEffect(() => {
        if (!open) return;
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeOnOutsideClick);
    }, [open]);

    const choose = (modelId: string) => {
        setReplacedModel(null);
        setQuery("");
        setActiveIndex(0);
        setOpen(false);
        onChange(modelId);
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            setOpen(false);
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
            return;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
            return;
        }
        if (event.key === "Enter") {
            // The picker lives inside a <form>; Enter chooses a model, it does not save settings.
            event.preventDefault();
            const model = filtered[activeIndex];
            if (model) choose(model.id);
        }
    };

    const status = (() => {
        if (isLoading) {
            return <p className="help">{t("Loading models…")}</p>;
        }
        if (isError) {
            return (
                <p className="help is-danger">
                    {t("Unable to load the model catalog.")}{" "}
                    {error instanceof Error ? error.message : ""}
                </p>
            );
        }
        if (!data) return null;
        if (data.degraded) {
            return (
                <p className="help is-warning">
                    {t("Live discovery unavailable — showing the verified fallback catalog.")}
                </p>
            );
        }
        if (models.length === 0) {
            return <p className="help is-warning">{t("No chat-capable models are available for this account.")}</p>;
        }

        return <p className="help">{t("Live catalog: {{count}} models", { count: models.length })}</p>;
    })();

    const canOpen = !isLoading && !isError && models.length > 0;

    return (
        <div>
            <div className="is-flex is-align-items-center" style={{ gap: "0.5rem" }}>
                <div className={styles.wrapper} ref={wrapperRef}>
                    <input
                        type="text"
                        readOnly
                        role="combobox"
                        aria-label={field.label}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        aria-controls={open ? listId : undefined}
                        aria-required={field.required}
                        className={`input ${styles.trigger}`}
                        value={
                            selected
                                ? modelLabel(selected)
                                : isLoading
                                  ? t("Loading models…")
                                  : t("Select a model")
                        }
                        disabled={disabled || !canOpen}
                        onClick={() => {
                            setOpen((current) => !current);
                            setQuery("");
                            setActiveIndex(0);
                        }}
                        onKeyDown={(event) => {
                            if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
                                event.preventDefault();
                                setOpen(true);
                                setActiveIndex(0);
                            }
                        }}
                    />
                    <span className={styles.chevron} aria-hidden="true">
                        ▾
                    </span>

                    {open && (
                        <div className={styles.panel}>
                            <input
                                type="search"
                                className={`input is-small ${styles.search}`}
                                aria-label={t("Search models")}
                                placeholder={t("Search models")}
                                value={query}
                                autoFocus
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setActiveIndex(0);
                                }}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <ul className={styles.list} id={listId}>
                                {filtered.map((model, index) => (
                                    <li key={model.id}>
                                        <button
                                            type="button"
                                            className={`${styles.option} ${index === activeIndex ? styles.active : ""}`}
                                            aria-current={model.id === value ? "true" : undefined}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() => choose(model.id)}
                                        >
                                            {modelLabel(model)}
                                        </button>
                                    </li>
                                ))}
                                {filtered.length === 0 && (
                                    <li className={styles.empty}>{t("No matching models.")}</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="button is-small"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                >
                    {t("Refresh models")}
                </button>
            </div>

            {replacedModel !== null && (
                <p className="help is-warning">
                    {t("The previously selected model is no longer available. Select a model.")}
                </p>
            )}
            {status}
        </div>
    );
};

export default AiModelSelect;
