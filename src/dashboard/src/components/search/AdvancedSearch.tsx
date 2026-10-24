import { useRecentSearchesQuery } from "api/system";
import NativeButton from "components/forms/NativeButton";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import Loading from "components/ui/Loading";
import { SearchUrls } from "AppUrls";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import Breadcrumb from "../ui/Breadcrumb";
import PageTitleHeader from "../ui/PageTitleHeader";
import styles from "./AdvancedSearch.module.css";

const entityList = {
    tasks: "Tasks",
    vulnerabilities: "Vulnerabilities",
    vulnerability_templates: "Vulnerability templates",
    projects: "Projects",
    project_templates: "Project templates",
};

const AdvancedSearch = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();

    const [keywords, setKeywords] = useState("");
    const [entities, setEntities] = useState(Object.keys(entityList));
    const { data: recentSearches, isLoading, isError } = useRecentSearchesQuery();

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        navigate(`/search/${encodeURIComponent(keywords.trim())}?entities=${entities.join(",")}`);
    };

    const onKeywordsChange = (ev) => {
        setKeywords(ev.target.value);
    };

    const onFormInputChange = (ev) => {
        const target = ev.target;
        const value = target.value;

        setEntities(target.checked ? [...entities, value] : entities.filter((entity) => entity !== value));
    };

    const renderRecentSearches = () => {
        if (isLoading) {
            return <Loading />;
        }

        if (isError) {
            return <p className="has-text-danger" role="alert">{t("Could not load recent searches.")}</p>;
        }

        if (!recentSearches?.length) {
            return <p className="has-text-grey">{t("No recent searches yet. Your searches will appear here.")}</p>;
        }

        return (
            <ul>
                {recentSearches.map((search: string) => (
                    <li key={search}>
                        <Link to={SearchUrls.KeywordsSearch.replace(":keywords", encodeURIComponent(search))}>{search}</Link>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb />
            </div>

            <PageTitleHeader title={t("Search form")} subHeader={t("Advanced search")} />

            <div className={styles.layout}>
                <form className="box" onSubmit={onFormSubmit}>
                    <div className="field">
                        <label className="label" htmlFor="keywords">
                            {t("Keywords")}
                        </label>
                        <NativeInput
                            id="keywords"
                            type="search"
                            name="keywords"
                            value={keywords}
                            onChange={onKeywordsChange}
                            placeholder={t("Keywords...")}
                            autoFocus
                            required
                        />
                    </div>

                    <fieldset className={styles.entities}>
                        <legend className="label">{t("Search in")}</legend>
                        {Object.keys(entityList).map((objectKey) => (
                            <NativeCheckbox
                                key={objectKey}
                                checked={entities.includes(objectKey)}
                                value={objectKey}
                                onChange={onFormInputChange}
                            >
                                {t(entityList[objectKey])}
                            </NativeCheckbox>
                        ))}
                    </fieldset>

                    {entities.length === 0 && (
                        <p className="help is-danger">{t("Select at least one type to search in.")}</p>
                    )}

                    <div className={styles.actions}>
                        <NativeButton type="submit" disabled={keywords.trim().length === 0 || entities.length === 0}>
                            {t("Search")}
                        </NativeButton>
                    </div>
                </form>

                <section className="box" aria-labelledby="recent-searches-heading">
                    <h2 id="recent-searches-heading" className="title is-5">
                        {t("Recent searches")}
                    </h2>
                    {renderRecentSearches()}
                </section>
            </div>
        </>
    );
};

export default AdvancedSearch;
