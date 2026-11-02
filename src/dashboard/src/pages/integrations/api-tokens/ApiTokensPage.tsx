import { useUserApiTokenDeleteMutation, useUserApiTokensQuery } from "api/user-api-tokens-hooks";
import DeleteButton from "components/ui/buttons/DeleteButton";
import NativeTable from "components/ui/tables/NativeTable";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState } from "react";
import { useConfirm } from "components/ui/useConfirm";
import { useTranslation } from "react-i18next";
import ApiTokenModalDialog from "../../../components/integrations/api-tokens/ApiTokenModalDialog";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import CreateButton from "../../../components/ui/buttons/CreateButton";
import PrimaryButton from "../../../components/ui/buttons/PrimaryButton";

const ApiTokensPage = () => {
    const { data: tokens, isLoading } = useUserApiTokensQuery();
    const deleteMutation = useUserApiTokenDeleteMutation();
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const [showForm, setShowForm] = useState(false);
    const [newToken, setNewToken] = useState<any>(null);

    const columns = [
        {
            header: t("Name"),
            cell: (token) => token.name,
        },
        {
            header: t("Scope"),
            cell: (token) => token.scope,
        },
        {
            header: t("Created at"),
            cell: (token) => new Date(token.createdAt).toLocaleString(),
        },
        {
            header: t("Expires at"),
            cell: (token) => new Date(token.expiresAt).toLocaleString(),
        },
        {
            header: t("Actions"),
            cell: (token) => (
                <DeleteButton display="icon" onClick={async () => {
                    if (await confirm(t("Are you sure you want to delete this token?"))) {
                        deleteMutation.mutate(token.id);
                    }
                }} />
            ),
        },
    ];

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
                <CreateButton onClick={() => setShowForm(true)}>{t("New API token")}&hellip;</CreateButton>
            </div>
            <PageTitleHeader title={t("API Tokens")} />

            {showForm && (
                <ApiTokenModalDialog
                    isOpen
                    onSuccess={(token) => {
                        setNewToken(token);
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {newToken && (
                <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#e7f3fe', border: '1px solid #2196F3', borderRadius: '4px' }}>
                    <strong>{t("Token created successfully!")}</strong>
                    <p>{t("Please copy this token now as it will not be shown again:")}</p>
                    <code style={{ display: 'block', padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc', margin: '10px 0' }}>
                        {newToken.tokenValue}
                    </code>
                    <PrimaryButton onClick={() => setNewToken(null)}>{t("I have copied the token")}</PrimaryButton>
                </div>
            )}

            <NativeTable
                columns={columns}
                rows={tokens}
                isLoading={isLoading}
            ></NativeTable>
            {confirmDialog}
        </div>
    );
};

export default ApiTokensPage;
