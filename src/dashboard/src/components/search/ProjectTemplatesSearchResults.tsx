import ProjectsTable from 'components/projects/ProjectsTable';
import { useEffect, useState } from 'react';
import { ignoreAbortError } from 'utilities/abort';
import { requestEntities } from 'utilities/requests.js';

const ProjectTemplatesSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }: any) => {

    const [projectTemplates, setProjectTemplates] = useState<any[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        const reloadData = () => {
            requestEntities(`/projects`, { isTemplate: "true", keywords }, { signal: controller.signal })
                .then(resp => resp.json())
                .then(results => {
                    const templates = results.data;
                    setProjectTemplates(templates);
                    setEmptyResults(emptyResults => 0 === templates.length ? emptyResults.concat('project_templates') : emptyResults.filter(value => value !== 'project_templates'));
                })
                .catch(ignoreAbortError)
        }

        reloadData()

        return () => controller.abort()
    }, [keywords, setEmptyResults])

    if (projectTemplates.length === 0) return <></>

    return <>
        <h3>{projectTemplates.length} matching project templates</h3>
        <ProjectsTable projects={projectTemplates} />
    </>
}

export default ProjectTemplatesSearchResults;
