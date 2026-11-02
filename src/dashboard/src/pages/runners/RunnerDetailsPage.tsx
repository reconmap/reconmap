import { requestRunnerDelete } from "api/requests/runners";
import { useRunnerQuery } from "api/runners";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import DeleteButton from "components/ui/buttons/DeleteButton";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import { toast } from "components/ui/toast";
import { useConfirm } from "components/ui/useConfirm";
import CommandTerminal from "components/ui/CommandTerminal";
import EmptyField from "components/ui/EmptyField";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import TimestampsSection from "components/ui/TimestampsSection";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "contexts/AuthContext";
import { hasRunnerTerminalAccess } from "services/auth";
import { useTranslation } from "react-i18next";
import { RunnersUrls } from "AppUrls";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastPingDate.getTime()) / 1000 / 60;
    return diffMinutes < 5; // Consider online if pinged within the last 5 minutes
}

const FieldValue = ({ value }: any) => (value === null || value === undefined || value === "" ? <EmptyField /> : value);

const RunnerDetailsPage = () => {
    const [t] = useTranslation();
    const { runnerId } = useParams() as any;
    const navigate = useNavigate();
    const { confirm, confirmDialog } = useConfirm();
    const { user } = useAuth();
    const terminalAllowed = hasRunnerTerminalAccess(user);

    const { data: runner, isLoading } = useRunnerQuery(runnerId);

    const [terminalVisibility, setTerminalVisibility] = useState(false);

    const connect = () => {
        setTerminalVisibility(true);
    };
    const disconnect = () => {
        setTerminalVisibility(false);
    };

    const handleDelete = async () => {
        if (!(await confirm("Are you sure you want to delete this runner?"))) return;
        const response = await requestRunnerDelete(runnerId);
        if (response.ok) {
            toast.success("Runner deleted successfully");
            navigate(RunnersUrls.List);
        } else {
            toast.error("Failed to delete runner");
        }
    };

    if (isLoading) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb current={runner.name} />
                <div className="buttons">
                    {terminalAllowed && <NativeButtonGroup>
                        <PrimaryButton onClick={connect} disabled={terminalVisibility}>
                            Connect
                        </PrimaryButton>
                        <PrimaryButton
                            className="button is-warning"
                            onClick={disconnect}
                            disabled={!terminalVisibility}
                        >
                            Disconnect
                        </PrimaryButton>
                    </NativeButtonGroup>}
                    <DeleteButton onClick={handleDelete} />
                </div>
            </div>
            <PageTitleHeader title={runner.name} subHeader={t("Runner")} />

            <p className="mb-4">
                <span className={`tag ${pingedRecently(runner.lastPingAt) ? "is-success" : "is-warning"}`}>
                    {pingedRecently(runner.lastPingAt) ? "Online" : "Offline"}
                </span>
            </p>

            <div className="grid grid-two">
                <dl className="content">
                    <dt>ID:</dt>
                    <dd><FieldValue value={runner.id} /></dd>

                    <dt>Client ID:</dt>
                    <dd><FieldValue value={runner.clientId} /></dd>

                    <dt>Enabled:</dt>
                    <dd>{runner.active ? "True" : "False"}</dd>

                    <dt>Version:</dt>
                    <dd><FieldValue value={runner.version} /></dd>

                    <dt>Hostname:</dt>
                    <dd><FieldValue value={runner.hostname} /></dd>

                    <dt>OS:</dt>
                    <dd><FieldValue value={runner.os} /></dd>

                    <dt>Architecture:</dt>
                    <dd><FieldValue value={runner.arch} /></dd>

                    <dt>CPU:</dt>
                    <dd><FieldValue value={runner.cpu} /></dd>

                    <dt>Memory:</dt>
                    <dd><FieldValue value={runner.memory} /></dd>

                    <dt>IP Address:</dt>
                    <dd><FieldValue value={runner.ip} /></dd>

                    <dt>Listen Address:</dt>
                    <dd><FieldValue value={runner.listenAddr} /></dd>
                </dl>

                <div>
                    <TimestampsSection entity={runner}>
                        <dt>Last booted</dt>
                        <dd>{runner.lastBootAt ? <RelativeDateFormatter date={runner.lastBootAt} /> : <EmptyField />}</dd>
                        <dt>Last pinged</dt>
                        <dd>{runner.lastPingAt ? <RelativeDateFormatter date={runner.lastPingAt} /> : <EmptyField />}</dd>
                    </TimestampsSection>
                </div>
            </div>

            {terminalAllowed && terminalVisibility &&
                <CommandTerminal runnerIp={runner.ip} runnerPort={runner.listenAddr} commands={[]} />
            }
            {confirmDialog}
        </div>
    );
};

export default RunnerDetailsPage;
