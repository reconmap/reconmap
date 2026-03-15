import ProjectsTable from 'components/projects/Table';
import { useEffect, useState } from 'react';
import { requestEntities } from 'utilities/requests.js';

const ProjectTemplatesSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }) => {

    const [projectTemplates, setProjectTemplates] = useState([]);

    useEffect(() => {
        const reloadData = () => {
            requestEntities(`/projects?isTemplate=true&keywords=${keywords}`)
                .then(resp => resp.json())
                .then(results => {
                    const templates = results.data;
                    setProjectTemplates(templates);
                    setEmptyResults(emptyResults => 0 === templates.length ? emptyResults.concat('project_templates') : emptyResults.filter(value => value !== 'project_templates'));
                })
        }

        reloadData()
    }, [keywords, setEmptyResults])

    if (projectTemplates.length === 0) return <></>

    return <>
        <h3>{projectTemplates.length} matching project templates</h3>
        <ProjectsTable projects={projectTemplates} />
    </>
}

export default ProjectTemplatesSearchResults;
