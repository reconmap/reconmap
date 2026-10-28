import { useUserApiTokenDeleteMutation, useUserApiTokensQuery } from "api/user-api-tokens-hooks";
import DeleteButton from "components/ui/buttons/DeleteButton";
import NativeTable from "components/ui/tables/NativeTable";
import ModalDialog from "components/ui/ModalDialog";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState } from "react";
import { useConfirm } from "components/ui/useConfirm";
import { useTranslation } from "react-i18next";
import ApiTokenForm from "../../../components/integrations/api-tokens/ApiTokenForm";
import Breadcrumb from "../../../components/ui/Breadcrumb";
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <PageTitleHeader title={t("API Tokens")} />
                <PrimaryButton onClick={() => setShowForm(true)}>{t("New API token")}</PrimaryButton>
            </div>

            <ModalDialog visible={showForm} onModalClose={() => setShowForm(false)} title={t("New API token")}>
                {showForm && (
                    <ApiTokenForm
                        onSuccess={(token) => {
                            setNewToken(token);
                            setShowForm(false);
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                )}
            </ModalDialog>

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
