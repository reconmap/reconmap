import { useDeleteVulnerabilityMutation, useVulnerabilitiesQuery } from "api/vulnerabilities.js";
import VulnerabilityBadge from "components/badges/VulnerabilityBadge";
import AscendingSortLink from "components/ui/AscendingSortLink";
import Breadcrumb from "components/ui/Breadcrumb";
import DescendingSortLink from "components/ui/DescendingSortLink";
import Loading from "components/ui/Loading";
import NoResults from "components/ui/NoResults";
import Title from "components/ui/Title";
import CreateButton from "components/ui/buttons/Create";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import PrimaryButton from "components/ui/buttons/Primary";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestEntityPost } from "utilities/requests.js";
import VulnerabilityCategorySpan from "../categories/Span";

const VulnerabilityTemplatesList = () => {
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState({
        column: "createdAt",
        order: "DESC",
    });
    const params = {
        isTemplate: 1,
        orderColumn: sortBy.column,
        orderDirection: sortBy.order,
    };
    const { data: templates, isLoading } = useVulnerabilitiesQuery(params);
    const deleteVulnerabilityMutation = useDeleteVulnerabilityMutation();

    const cloneVulnerability = (ev, templateId) => {
        ev.stopPropagation();

        requestEntityPost(`/vulnerabilities/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/vulnerabilities/${data.vulnerabilityId}/edit`);
            });
    };

    const onSortChange = (ev, column, order) => {
        ev.preventDefault();

        setSortBy({ column: column, order: order });
    };

    const viewTemplate = (templateId) => {
        navigate(`/vulnerabilities/templates/${templateId}`);
    };

    const deleteTemplate = (ev, templateId) => {
        ev.stopPropagation();

        deleteVulnerabilityMutation.mutate(templateId);
    };

    const onAddVulnerabilityTemplateClick = () => {
        navigate(`/vulnerabilities/create?isTemplate=true`);
    };

    if (isLoading) return <Loading />;

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/vulnerabilities">Vulnerabilities</Link>
                </Breadcrumb>

                <CreateButton onClick={onAddVulnerabilityTemplateClick}>Add vulnerability template</CreateButton>
            </div>
            <Title type="Library" title="Vulnerability templates" />
            {isLoading ? (
                <Loading />
            ) : (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Summary</th>
                            <th colSpan={2}>
                                <DescendingSortLink callback={onSortChange} property="category_name" /> Category{" "}
                                <AscendingSortLink callback={onSortChange} property="category_name" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.data.length === 0 ? (
                            <tr>
                                <td colSpan={3}>
                                    <NoResults />
                                </td>
                            </tr>
                        ) : (
                            templates.data.map((template) => (
                                <tr key={template.id} onClick={() => viewTemplate(template.id)}>
                                    <td>
                                        <VulnerabilityBadge vulnerability={template} />
                                    </td>
                                    <td>
                                        <VulnerabilityCategorySpan
                                            name={template.category_name}
                                            parentName={template.parent_category_name}
                                        />
                                    </td>
                                    <td>
                                        <LinkButton href={`/vulnerabilities/${template.id}/edit`}>Edit</LinkButton>
                                        <PrimaryButton
                                            onClick={(ev) => cloneVulnerability(ev, template.id)}
                                            key={template.id}
                                            title="Clone"
                                        >
                                            Clone and edit
                                        </PrimaryButton>
                                        <DeleteIconButton onClick={(ev) => deleteTemplate(ev, template.id)} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
};

export default VulnerabilityTemplatesList;
