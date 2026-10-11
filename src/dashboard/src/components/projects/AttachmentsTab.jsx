import { useAttachmentsQuery } from "api/attachments.js";
import AttachmentsTable from "components/attachments/AttachmentsTable";
import AttachmentsDropzone from "components/attachments/Dropzone";
import RestrictedComponent from "components/logic/RestrictedComponent";

const ProjectAttachmentsTab = ({ project }) => {
    const parentType = "project";
    const parentId = project.id;
    const { data: attachments } = useAttachmentsQuery({ parentType, parentId });

    return (
        <section>
            <RestrictedComponent roles={["administrator", "superuser", "user"]} message="(access restricted)">
                <AttachmentsDropzone parentType={parentType} parentId={parentId} />

                <h4>Attachment list</h4>
                <AttachmentsTable attachments={attachments} />
            </RestrictedComponent>
        </section>
    );
};

export default ProjectAttachmentsTab;
