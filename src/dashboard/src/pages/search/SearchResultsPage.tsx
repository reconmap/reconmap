
import ProjectsSearchResults from "components/search/ProjectsSearchResults";
import ProjectTemplatesSearchResults from "components/search/ProjectTemplatesSearchResults";
import TasksSearchResults from "components/search/TasksSearchResults";
import FindingsSearchResults from "components/search/FindingsSearchResults";
import FindingTemplatesSearchResults from "components/search/FindingTemplatesSearchResults";
import Breadcrumb from "components/ui/Breadcrumb";
import LinkButton from "components/ui/buttons/LinkButton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router";
import { SearchUrls } from "AppUrls";

const SearchResultsPage = React.memo(() => {
    const [t] = useTranslation();
    const params = useParams() as any;
    const [query] = useSearchParams();
    const keywords = params.keywords;

    const entitiesParam = query.has("entities")
        ? query.get("entities")
        : "tasks,findings,finding_templates,projects,project_templates";
    const entities = useMemo(() => entitiesParam!.split(","), [entitiesParam]);

    const [emptyResults, setEmptyResults] = useState<any[]>([]);

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <div>
                    <LinkButton href={SearchUrls.AdvancedSearch}>{t("Advanced search")}</LinkButton>
                </div>
            </div>
            <PageTitleHeader title={`${t("Search results")}: ${keywords}`} header={`${t("Results for")} "${keywords}"`} subHeader={t("Search")} />

            {emptyResults.length > 0 && (
                <div {...({ status: "warning" } as any)}>No results were found for: {[...new Set([...emptyResults])].join(", ")}</div>
            )}

            {entities.includes("tasks") && (
                <TasksSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
            {entities.includes("findings") && (
                <FindingsSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
            )}
            {entities.includes("finding_templates") && (
                <FindingTemplatesSearchResults keywords={keywords} emptyResultsSetter={setEmptyResults} />
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

SearchResultsPage.displayName = "SearchResultsPage";

export default SearchResultsPage;
