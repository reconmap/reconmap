import { useProjectVaultQuery } from "api/projects.js";
import RestrictedComponent from "components/logic/RestrictedComponent";
import VaultSecretForm from "./VaultSecretForm.jsx";
import VaultTable from "./VaultTable.jsx";

const ProjectVaultTab = ({ project }) => {
    const { data: secrets } = useProjectVaultQuery(project.id);

    return (
        <section>
            <RestrictedComponent roles={["administrator", "superuser", "user"]} message="(access restricted)">
                <VaultTable secrets={secrets} />
                <VaultSecretForm projectId={project.id} />
            </RestrictedComponent>
        </section>
    );
};

export default ProjectVaultTab;
