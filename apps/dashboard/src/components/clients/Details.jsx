import { useQueryClient } from "@tanstack/react-query";
import {
    useDeleteOrganisationMutation,
    useOrganisationContactsQuery,
    useOrganisationQuery,
    useOrganisationsQueriesInvalidation,
} from "api/clients.js";
import { useProjectsQuery } from "api/projects.js";
import { requestAttachment } from "api/requests/attachments.js";
import { requestContactDelete } from "api/requests/contacts.js";
import { requestOrganisationContactPost } from "api/requests/organisations.js";
import NativeButton from "components/form/NativeButton";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import NativeTabs from "components/form/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import ProjectsTable from "components/projects/Table";
import EmptyField from "components/ui/EmptyField";
import MailLink from "components/ui/MailLink";
import TelephoneLink from "components/ui/TelephoneLink";
import TimestampsSection from "components/ui/TimestampsSection";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import UserLink from "components/users/Link";
import Contact from "models/Contact";
import OrganisationTypes from "models/OrganisationTypes.js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import ExternalLink from "../ui/ExternalLink";
import Title from "../ui/Title";
import DeleteButton from "../ui/buttons/Delete";
import Loading from "./../ui/Loading";
import OrganisationsUrls from "./OrganisationsUrls";

const ContactTypes = {
    general: "General",
    technical: "Technical",
    billing: "Billing",
};

const ClientProjectsTab = ({ clientId }) => {
    const { data: projects, isLoading } = useProjectsQuery({ clientId: clientId });

    if (isLoading) return <Loading />;

    if (projects.data.length === 0) {
        return (
            <div>
                This client has no projects. You can see all projects and their clients <Link to="/projects">here</Link>
                .
            </div>
        );
    }

    return (
        <div>
            <ProjectsTable projects={projects.data} showClientColumn={false} />
        </div>
    );
};

const ClientDetails = () => {
    const [t] = useTranslation();

    const { clientId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: client, isLoading: isClientLoading } = useOrganisationQuery(clientId);
    const { data: contacts } = useOrganisationContactsQuery(clientId);
    const deleteOrganisationMutation = useDeleteOrganisationMutation();
    const invalidateOrganisations = useOrganisationsQueriesInvalidation();

    const [contact, setContact] = useState({ ...Contact });

    const [tabIndex, tabIndexSetter] = useState(0);

    const onContactFormChange = (ev) => {
        setContact({ ...contact, [ev.target.name]: ev.target.value });
    };

    const [logo, setLogo] = useState(null);
    const [smallLogo, setSmallLogo] = useState(null);

    const handleDelete = async () => {
        const confirmed = await deleteOrganisationMutation.mutateAsync(clientId);
        if (confirmed) navigate("/organisations");
    };

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        requestOrganisationContactPost(clientId, contact).then((resp) => {
            if (resp.status === 201) {
                setContact({ ...Contact });
                invalidateOrganisations();
                actionCompletedToast(`The contact has been added.`);
            } else {
                errorToast("The contact could not be saved. Review the form data or check the application logs.");
            }
        });
    };

    const onContactDelete = (contactId) => {
        requestContactDelete(clientId, contactId)
            .then((resp) => {
                if (resp.ok) {
                    actionCompletedToast("The contact has been deleted.");
                    invalidateOrganisations();
                } else {
                    errorToast("Unable to delete contact");
                }
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        if (client) {
            if (client.small_logo_attachment_id) {
                downloadAndDisplayLogo(client.small_logo_attachment_id, "small_logo");
            }

            if (client.logo_attachment_id) {
                downloadAndDisplayLogo(client.logo_attachment_id, "logo");
            }
        }
    }, [client]);

    const downloadAndDisplayLogo = (logoId, type) => {
        requestAttachment(logoId).then(({ blob }) => {
            const url = URL.createObjectURL(blob);
            if (type === "small_logo") {
                setSmallLogo(url);
            } else {
                setLogo(url);
            }
        });
    };

    if (isClientLoading) {
        return <Loading />;
    }

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to={OrganisationsUrls.List}>Organisations</Link>
                    <Link>{client.name}</Link>
                </Breadcrumb>
                <NativeButtonGroup>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={OrganisationsUrls.Edit.replace(":organisationId", client.id)}>
                            {t("Edit")}
                        </LinkButton>
                        <DeleteButton onClick={handleDelete} />
                    </RestrictedComponent>
                </NativeButtonGroup>
            </div>
            <article>
                <div>
                    <Title type={OrganisationTypes[client.kind]} title={client.name} />
                </div>

                <div>
                    <NativeTabs
                        labels={["Details", "Contacts", "Projects"]}
                        tabIndex={tabIndex}
                        tabIndexSetter={tabIndexSetter}
                    />
                    <div>
                        {0 === tabIndex && (
                            <div>
                                <div className="grid grid-two">
                                    <div className="content">
                                        <h4>Properties</h4>

                                        <dl>
                                            <dt>Address</dt>
                                            <dd>{client.address ?? "-"}</dd>

                                            <dt>URL</dt>
                                            <dd>
                                                <ExternalLink href={client.url}>{client.url}</ExternalLink>
                                            </dd>
                                        </dl>

                                        <h4>Branding</h4>

                                        <dl>
                                            <dt>Main logo</dt>
                                            <dd>{logo ? <img src={logo} alt="The main logo" /> : <EmptyField />}</dd>

                                            <dt>Small logo</dt>
                                            <dd>
                                                {smallLogo ? (
                                                    <img src={smallLogo} alt="The smaller version of the logo" />
                                                ) : (
                                                    <EmptyField />
                                                )}
                                            </dd>
                                        </dl>
                                    </div>

                                    <div className="content">
                                        <h4>Relations</h4>
                                        <dl>
                                            <dt>Created by</dt>
                                            <dd>
                                                <UserLink userId={client.createdByUid}>
                                                    {client.createdBy?.fullName}
                                                </UserLink>
                                            </dd>
                                        </dl>

                                        <TimestampsSection entity={client} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {1 === tabIndex && (
                            <div>
                                <h4 className="title is-4">Contacts</h4>

                                {contacts && (
                                    <>
                                        <form onSubmit={onFormSubmit}>
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Type</th>
                                                        <th>Name</th>
                                                        <th>Role</th>
                                                        <th>Email</th>
                                                        <th>Phone</th>
                                                        <th>&nbsp;</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <NativeSelect
                                                                name="kind"
                                                                onChange={onContactFormChange}
                                                                value={contact.kind || ""}
                                                                required
                                                            >
                                                                <option value="general">General</option>
                                                                <option value="technical">Technical</option>
                                                                <option value="billing">Billing</option>
                                                            </NativeSelect>
                                                        </td>
                                                        <td>
                                                            <NativeInput
                                                                type="text"
                                                                name="name"
                                                                onChange={onContactFormChange}
                                                                value={contact.name || ""}
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <NativeInput
                                                                type="text"
                                                                name="role"
                                                                onChange={onContactFormChange}
                                                                value={contact.role || ""}
                                                            />
                                                        </td>
                                                        <td>
                                                            <NativeInput
                                                                type="email"
                                                                name="email"
                                                                onChange={onContactFormChange}
                                                                value={contact.email || ""}
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <NativeInput
                                                                type="tel"
                                                                name="phone"
                                                                onChange={onContactFormChange}
                                                                value={contact.phone || ""}
                                                            />
                                                        </td>
                                                        <td>
                                                            <NativeButton type="submit">Add</NativeButton>
                                                        </td>
                                                    </tr>
                                                    {0 === contacts.length && <NoResultsTableRow numColumns={6} />}
                                                    {contacts.map((contact, index) => (
                                                        <>
                                                            <tr key={index}>
                                                                <td>{ContactTypes[contact.kind]}</td>
                                                                <td>{contact.name}</td>
                                                                <td>{contact.role}</td>
                                                                <td>
                                                                    <MailLink email={contact.email} />
                                                                </td>
                                                                <td>
                                                                    <TelephoneLink number={contact.phone} />
                                                                </td>
                                                                <td>
                                                                    <DeleteIconButton
                                                                        onClick={onContactDelete.bind(this, contact.id)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        </>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}
                        {2 === tabIndex && (
                            <div>
                                <ClientProjectsTab clientId={clientId} />
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default ClientDetails;
