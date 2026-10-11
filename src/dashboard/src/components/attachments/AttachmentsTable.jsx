import { useAttachmentDeleteMutation } from "api/attachments.js";
import { requestAttachment } from "api/requests/attachments.js";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import SecondaryButton from "components/ui/buttons/Secondary";
import FileSizeSpan from "components/ui/FileSizeSpan";
import Loading from "components/ui/Loading";
import ModalDialog from "components/ui/ModalDIalog";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import UserLink from "components/users/Link";
import { resolveMime } from "friendly-mimes";
import { useState } from "react";

const AttachmentsTable = ({ attachments }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [content, setContent] = useState(null);

    const onModalClose = () => {
        setModalVisible(false);
    };

    const deleteAttachmentMutation = useAttachmentDeleteMutation();

    const onViewClick = (ev, attachmentId) => {
        requestAttachment(attachmentId).then(async ({ contentType, blob }) => {
            if (contentType.indexOf("image/") !== -1) {
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
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    const onDeleteAttachmentClick = (ev, attachmentId) => {
        deleteAttachmentMutation.mutate(attachmentId);
    };

    const safeResolveMime = (mimeType) => {
        try {
            return resolveMime(mimeType)["name"];
        } catch (err) {
            console.error(err);
            return mimeType;
        }
    };

    if (!attachments) {
        return <Loading />;
    }

    const columns = [
        {
            header: "Filename",
            property: "clientFileName",
        },
        {
            header: "Mimetype",
            cell: (attachment) => (
                <span title={safeResolveMime(attachment.fileMimeType)}>{attachment.fileMimeType}</span>
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
            cell: (attachment) => <UserLink userId={attachment.submitterUid}>{attachment.submitterName}</UserLink>,
        },
        {
            header: "Filename",
            cell: (attachment) => (
                <>
                    <SecondaryButton onClick={(ev) => onViewClick(ev, attachment.id)}>View</SecondaryButton>
                    <SecondaryButton onClick={(ev) => onDownloadClick(ev, attachment.id)}>Download</SecondaryButton>
                    <DeleteIconButton onClick={(ev) => onDeleteAttachmentClick(ev, attachment.id)} />
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
        </>
    );
};

export default AttachmentsTable;
