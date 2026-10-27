import ProjectsTable from 'components/projects/ProjectsTable';
import { useEffect, useState } from 'react';
import { ignoreAbortError } from 'utilities/abort';
import { requestEntities } from 'utilities/requests.js';

const ProjectsSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }: any) => {

    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        const reloadData = () => {
            requestEntities(`/projects`, { isTemplate: "false", keywords }, { signal: controller.signal })
                .then(resp => resp.json())
                .then(results => {
                    const projects = results.data;
                    setProjects(projects);
                    setEmptyResults(emptyResults => 0 === projects.length ? emptyResults.concat('projects') : emptyResults.filter(value => value !== 'projects'));
                })
                .catch(ignoreAbortError)
        }

        reloadData()

        return () => controller.abort()
    }, [keywords, setEmptyResults])

    if (projects.length === 0) return <></>

    return <>
        <h3>{projects.length} matching projects</h3>
        <ProjectsTable projects={projects} />
    </>
}

export default ProjectsSearchResults;
