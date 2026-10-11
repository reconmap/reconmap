import ProjectsTable from 'components/projects/Table';
import { useEffect, useState } from 'react';
import { requestEntities } from 'utilities/requests.js';

const ProjectsSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }) => {

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const reloadData = () => {
            requestEntities(`/projects?isTemplate=false&keywords=${keywords}`)
                .then(resp => resp.json())
                .then(results => {
                    const projects = results.data;
                    setProjects(projects);
                    setEmptyResults(emptyResults => 0 === projects.length ? emptyResults.concat('projects') : emptyResults.filter(value => value !== 'projects'));
                })
        }

        reloadData()
    }, [keywords, setEmptyResults])

    if (projects.length === 0) return <></>

    return <>
        <h3>{projects.length} matching projects</h3>
        <ProjectsTable projects={projects} />
    </>
}

export default ProjectsSearchResults;
