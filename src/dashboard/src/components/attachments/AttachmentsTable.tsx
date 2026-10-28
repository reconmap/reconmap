import { useConfirm } from "components/ui/useConfirm";
import { useAttachmentDeleteMutation } from "api/attachments";
import { requestAttachment } from "api/requests/attachments";
import DeleteButton from "components/ui/buttons/DeleteButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import FileSizeSpan from "components/ui/FileSizeSpan";
import ModalDialog from "components/ui/ModalDialog";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import NativeTable from "components/ui/tables/NativeTable";
import UserLink from "components/users/UserLink";
import { mimeTypeName } from "utilities/mimeTypes";
import { useState } from "react";

const AttachmentsTable = ({ attachments }: any) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [content, setContent] = useState<any>(null);

    const onModalClose = () => {
        setModalVisible(false);
    };

    const deleteAttachmentMutation = useAttachmentDeleteMutation();
    const { confirm, confirmDialog } = useConfirm();

    const onViewClick = (ev, attachmentId) => {
        requestAttachment(attachmentId).then(async ({ contentType, blob }) => {
            if (contentType!.indexOf("image/") !== -1) {
                setContent(<img src={await URL.createObjectURL(blob)} alt="" />);
                // @todo -> URL.revokeObjectURL
            } else {
                setContent(<textarea style={{ width: "100%", height: "90%" }} value={await blob.text()} readOnly />);
            }
            setModalVisible(true);
        });
    };

    const onDownloadClick = (ev, attachmentId) => {
        requestAttachment(attachmentId).then(({ blob, filename }) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename!;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    const onDeleteAttachmentClick = async (ev, attachmentId) => {
        if (!(await confirm("Are you sure you want to delete this attachment?"))) return;
        deleteAttachmentMutation.mutate(attachmentId);
    };


    const columns = [
        {
            header: "Filename",
            property: "clientFileName",
        },
        {
            header: "Mimetype",
            cell: (attachment) => (
                <span title={mimeTypeName(attachment.fileMimeType)}>{attachment.fileMimeType}</span>
            ),
        },
        {
            header: "File size",
            cell: (attachment) => <FileSizeSpan fileSize={attachment.fileSize} />,
        },
        {
            header: "Upload date",
            cell: (attachment) => <RelativeDateFormatter date={attachment.createdAt} />,
        },
        {
            header: "Uploaded by",
            cell: (attachment) => <UserLink userId={attachment.createdById}>{attachment.createdBy?.fullName}</UserLink>,
        },
        {
            header: "Filename",
            cell: (attachment) => (
                <>
                    <SecondaryButton onClick={(ev) => onViewClick(ev, attachment.id)}>View&hellip;</SecondaryButton>
                    <SecondaryButton onClick={(ev) => onDownloadClick(ev, attachment.id)}>Download</SecondaryButton>
                    <DeleteButton display="icon" onClick={(ev) => onDeleteAttachmentClick(ev, attachment.id)} />
                </>
            ),
        },
    ];

    return (
        <>
            <ModalDialog
                visible={modalVisible}
                title="Preview output"
                onModalClose={onModalClose}
                style={{ overflow: "auto", width: "80%", height: "80%", maxHeight: "80%" }}
            >
                {content}
            </ModalDialog>

            <NativeTable columns={columns} rows={attachments} rowId={(attachment) => attachment.id}></NativeTable>
            {confirmDialog}
        </>
    );
};

export default AttachmentsTable;
