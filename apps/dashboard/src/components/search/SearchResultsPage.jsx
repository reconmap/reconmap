import LinkButton from "components/ui/buttons/Link";
import Title from "components/ui/Title";
import useQuery from "hooks/useQuery";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb.jsx";
import CommandsSearchResults from "./CommandsSearchResults.jsx";
import ProjectsSearchResults from "./ProjectsSearchResults.jsx";
import ProjectTemplatesSearchResults from "./ProjectTemplatesSearchResults.jsx";
import SearchUrls from "./SearchUrls";
import TasksSearchResults from "./TasksSearchResults.jsx";
import VulnerabilitiesSearchResults from "./VulnerabilitiesSearchResults.jsx";
import VulnerabilityTemplatesSearchResults from "./VulnerabilityTemplatesSearchResults.jsx";

const SearchResultsPage = React.memo(() => {
    const [t] = useTranslation();
    const params = useParams();
    const query = useQuery();
    const keywords = decodeURIComponent(params.keywords);

    const entitiesParam = query.has("entities")
        ? query.get("entities")
        : "commands,tasks,vulnerabilities,vulnerability_templates,projects,project_templates";
    const entities = useMemo(() => entitiesParam.split(","), [entitiesParam]);

    const [emptyResults, setEmptyResults] = useState([]);

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <div>
                    <LinkButton href={SearchUrls.AdvancedSearch}>{t("Advanced search")}</LinkButton>
                </div>
            </div>
            <Title type={t("Search results")} title={keywords} />

            {emptyResults.length > 0 && (
                <div status="warning">No results were found for: {[...new Set([...emptyResults])].join(", ")}</div>
            )}

            {entities.includes("commands") && (
                <CommandsSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
            {entities.includes("tasks") && (
                <TasksSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
            {entities.includes("vulnerabilities") && (
                <VulnerabilitiesSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
            {entities.includes("vulnerability_templates") && (
                <VulnerabilityTemplatesSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
            {entities.includes("projects") && (
                <ProjectsSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
            {entities.includes("project_templates") && (
                <ProjectTemplatesSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
        </>
    );
});

export default SearchResultsPage;
