import { useTranslation } from "react-i18next";

const STATUS_CLASSES: Record<string, string> = {
    queued: "is-light",
    running: "is-info",
    succeeded: "is-success",
    failed: "is-danger",
    partial: "is-warning",
};

const ScanStatusTag = ({ status }: { status: string }) => {
    const { t } = useTranslation();
    const labels: Record<string, string> = {
        queued: t("Queued"),
        running: t("Running"),
        succeeded: t("Succeeded"),
        failed: t("Failed"),
        partial: t("Partially failed"),
    };

    return <span className={`tag ${STATUS_CLASSES[status] ?? "is-light"}`}>{labels[status] ?? status}</span>;
};

export default ScanStatusTag;
