import { useProjectVaultQuery } from "api/projects";
import RestrictedComponent from "components/logic/RestrictedComponent";
import VaultSecretForm from "./VaultSecretForm";
import VaultTable from "./VaultTable";

const ProjectVaultTab = ({ project }: any) => {
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
