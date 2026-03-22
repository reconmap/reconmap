import { useAttachmentsQuery } from "api/attachments.js";
import { requestAttachment, requestAttachmentDelete } from "api/requests/attachments.js";
import AttachmentsDropzone from "components/attachments/Dropzone";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import RestrictedComponent from "components/logic/RestrictedComponent";
import FileSizeSpan from "components/ui/FileSizeSpan";
import Loading from "components/ui/Loading.jsx";
import ModalDialog from "components/ui/ModalDIalog";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import SecondaryButton from "components/ui/buttons/Secondary";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import UserLink from "components/users/Link";
import { useState } from "react";
import { actionCompletedToast } from "../ui/toast";

const CommandOutputs = ({ command }) => {
    const { data: commandOutputs, isLoading } = useAttachmentsQuery({ parentType: "command", parentId: command.id });
    const [modalVisible, setModalVisible] = useState(false);
    const [content, setContent] = useState(null);

    const onDeleteOutputClick = (ev, attachmentId) => {
        ev.preventDefault();

        requestAttachmentDelete(attachmentId)
            .then(() => {
                actionCompletedToast("The output has been deleted.");
            })
            .catch((err) => console.error(err));
    };

    const onDownloadClick = (ev, attachmentId) => {
        requestAttachment(attachmentId).then(({ blob, filename }) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    const onViewClick = (ev, attachmentId) => {
        requestAttachment(attachmentId).then(async ({ blob }) => {
            setContent(await blob.text());
            setModalVisible(true);
        });
    };

    const onModalClose = () => {
        setModalVisible(false);
    };

    if (isLoading) return <Loading />;

    const columns = [
        {
            header: "Filename",
            cell: (commandOutput) => commandOutput.clientFileName,
        },
        {
            header: "Mimetype",
            cell: (commandOutput) => commandOutput.fileMimeType,
        },
        {
            header: "File size",
            cell: (commandOutput) => <FileSizeSpan fileSize={commandOutput.fileSize} />,
        },
        {
            header: "Upload date",
            cell: (commandOutput) => <RelativeDateFormatter date={commandOutput.createdAt} />,
        },
        {
            header: "Uploaded by",
            cell: (commandOutput) => (
                <UserLink userId={commandOutput.createdByUid}>
                    {commandOutput.createdBy?.fullName}
                </UserLink>
            ),
        },
        {
            header: <>&nbsp;</>,
            cell: (commandOutput) => (
                <NativeButtonGroup>
                    <SecondaryButton onClick={(ev) => onViewClick(ev, commandOutput.id)}>View</SecondaryButton>
                    <SecondaryButton onClick={(ev) => onDownloadClick(ev, commandOutput.id)}>
                        Download
                    </SecondaryButton>
                    <DeleteIconButton onClick={(ev) => onDeleteOutputClick(ev, commandOutput.id)} />
                </NativeButtonGroup>
            ),
        },
    ];

    return (
        <>
            <ModalDialog
                visible={modalVisible}
                title="Preview output"
                onModalClose={onModalClose}
                style={{ width: "80%", height: "80%", maxHeight: "80%" }}
            >
                <textarea style={{ width: "100%", height: "90%" }} defaultValue={content} readOnly></textarea>
            </ModalDialog>

            <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                <AttachmentsDropzone parentType={"command"} parentId={command.id} />
            </RestrictedComponent>

            <h4>Command output list</h4>

            <NativeTable
                columns={columns}
                rows={commandOutputs}
                rowId={(commandOutput) => commandOutput.id}
                emptyRowsMessage="No command outputs available."
            ></NativeTable>
        </>
    );
};

export default CommandOutputs;
