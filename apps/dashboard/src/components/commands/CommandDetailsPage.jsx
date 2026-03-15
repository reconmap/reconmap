import { useQueryClient } from "@tanstack/react-query";
import { useCommandDeleteMutation, useCommandQuery, useCommandUsagesQuery } from "api/commands.js";
import { requestCommandUsageDelete } from "api/requests/commands.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import NativeTabs from "components/form/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import EmptyField from "components/ui/EmptyField";
import ExternalLink from "components/ui/ExternalLink";
import Tags from "components/ui/Tags";
import TimestampsSection from "components/ui/TimestampsSection";
import Title from "components/ui/Title";
import LinkButton from "components/ui/buttons/Link";
import UserLink from "components/users/Link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb.jsx";
import Loading from "../ui/Loading.jsx";
import DeleteButton from "../ui/buttons/Delete.jsx";
import CommandInstructions from "./Instructions.jsx";
import CommandOutputs from "./Outputs.jsx";
import ScheduledRuns from "./ScheduledRuns.jsx";

const CommandDetailsPage = () => {
    const [t] = useTranslation();

    const { commandId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [tabIndex, tabIndexSetter] = useState(0);

    const { data: command, isLoading } = useCommandQuery(commandId);
    const { data: commandUsages, refetch: refetchCommandUsages } = useCommandUsagesQuery(commandId);
    const deleteCommandMutation = useCommandDeleteMutation();

    const handleDelete = async () => {
        const confirmed = await deleteCommandMutation.mutateAsync(commandId);
        if (confirmed) navigate("/commands");
    };

    const deleteUsage = (usage) => {
        requestCommandUsageDelete(usage.commandId, usage.id).finally(() => {
            queryClient.invalidateQueries(["commands", parseInt(commandId), "usages"]);
            refetchCommandUsages();
        });
    };

    if (isLoading) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/commands">Commands</Link>
                </Breadcrumb>
                <NativeButtonGroup>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/commands/${command.id}/edit`}>Edit</LinkButton>
                        <DeleteButton onClick={handleDelete} />
                    </RestrictedComponent>
                </NativeButtonGroup>
            </div>
            <article>
                <div>
                    <Title type={t("Command")} title={command.name} />
                    <Tags values={command.tags} />
                </div>

                <NativeTabs
                    labels={[t("Details"), t("Usages"), "Run instructions", "Scheduled runs", "Command outputs"]}
                    tabIndex={tabIndex}
                    tabIndexSetter={tabIndexSetter}
                />

                <div>
                    <div>
                        {0 === tabIndex && (
                            <div className="content">
                                <div className="grid grid-two">
                                    <div>
                                        <dl>
                                            <dt>{t("Description")}</dt>
                                            <dd>
                                                {command.description ? (
                                                    <ReactMarkdown>{command.description}</ReactMarkdown>
                                                ) : (
                                                    <EmptyField />
                                                )}
                                            </dd>

                                            {command.output_parser && (
                                                <>
                                                    <dt>Output parser support</dt>
                                                    <dl>Yes ({command.output_parser})</dl>
                                                </>
                                            )}
                                            {command.more_info_url && (
                                                <>
                                                    <dt>More information URL</dt>
                                                    <dl>
                                                        {command.more_info_url ? (
                                                            <ExternalLink href={command.more_info_url}>
                                                                {command.more_info_url}
                                                            </ExternalLink>
                                                        ) : (
                                                            <EmptyField />
                                                        )}
                                                    </dl>
                                                </>
                                            )}
                                        </dl>
                                    </div>

                                    <div className="content">
                                        <h4>{t("Relations")}</h4>
                                        <dl>
                                            <dt>Created by</dt>
                                            <dd>
                                                <UserLink userId={command.createdByUid}>
                                                    {command.createdBy?.fullName}
                                                </UserLink>
                                            </dd>
                                        </dl>

                                        <TimestampsSection entity={command} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {1 === tabIndex && (
                            <div>
                                <Link className="button is-success" to={`/commands/${command.id}/usages`}>Add usage</Link>{" "}
                                {commandUsages !== null && (
                                    <>
                                        <table className="table is-fullwidth">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Options</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {commandUsages.map((usage) => (
                                                    <tr key={usage.id}>
                                                        <td>{usage.name}</td>
                                                        <td>
                                                            <DeleteButton onClick={(ev) => deleteUsage(usage)} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        )}
                        {2 === tabIndex && (
                            <div>
                                {commandUsages !== null && (
                                    <CommandInstructions command={command} usages={commandUsages} />
                                )}
                            </div>
                        )}{" "}
                        {3 === tabIndex && (
                            <div>
                                {commandUsages !== null && <ScheduledRuns command={command} usages={commandUsages} />}
                            </div>
                        )}
                        {4 === tabIndex && (
                            <div>
                                <CommandOutputs command={command} />
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default CommandDetailsPage;
