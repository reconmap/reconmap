import { useRecentSearchesQuery } from "api/system.js";
import NativeButton from "components/form/NativeButton";
import NativeCheckbox from "components/form/NativeCheckbox";
import NativeInput from "components/form/NativeInput";
import Loading from "components/ui/Loading.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";
import SearchUrls from "./SearchUrls";

const entityList = {
    commands: "Commands",
    tasks: "Tasks",
    vulnerabilities: "Vulnerabilities",
    vulnerability_templates: "Vulnerability templates",
    projects: "Projects",
    project_templates: "Project templates",
};

const AdvancedSearch = () => {
    const navigate = useNavigate();

    const [keywords, setKeywords] = useState("");
    const [entities, setEntities] = useState(Object.keys(entityList));
    const { data: recentSearches, isLoading: isLoadingRecentSearches } = useRecentSearchesQuery();

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        navigate(`/search/${keywords.trim()}?entities=` + entities.join(","));
    };

    const onKeywordsChange = (ev) => {
        setKeywords(ev.target.value);
    };

    const onFormInputChange = (ev) => {
        const target = ev.target;
        const value = target.value;

        setEntities(target.checked ? [...entities, value] : entities.filter((entity) => entity !== value));
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb />
            </div>

            <Title title="Search form" type="Advanced search" documentTitle="single" />

            <div className="columns">
                <div className="column is-three-quarters">
                    <form onSubmit={onFormSubmit}>
                        <NativeInput
                            type="search"
                            name="keywords"
                            value={keywords}
                            onChange={onKeywordsChange}
                            placeholder="Keywords..."
                            autoFocus
                            required
                        />

                        {Object.keys(entityList).map((objectKey) => (
                            <NativeCheckbox
                                checked={entities.includes(objectKey)}
                                value={objectKey}
                                onChange={onFormInputChange}
                            >
                                {entityList[objectKey]}
                            </NativeCheckbox>
                        ))}

                        <NativeButton type="submit" disabled={keywords.trim().length === 0 || entities.length === 0}>
                            Search
                        </NativeButton>
                    </form>
                </div>
                <div className="column">
                    <h4 className="is-size-4">Recent searches</h4>
                    {isLoadingRecentSearches ? (
                        <Loading />
                    ) : (
                        <>
                            {recentSearches === null ? (
                                <>No searches.</>
                            ) : (
                                <ol>
                                    {recentSearches.map((search, index) => (
                                        <li key={index}>
                                            <Link to={SearchUrls.KeywordsSearch.replace(":keywords", search)}>
                                                {search}
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdvancedSearch;
