import { useUserApiTokenDeleteMutation, useUserApiTokensQuery } from "api/user-api-tokens-hooks";
import DeleteButton from "components/ui/buttons/Delete.jsx";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import Title from "components/ui/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../../ui/Breadcrumb";
import PrimaryButton from "../../ui/buttons/Primary";
import ApiTokenForm from "./ApiTokenForm";

const ApiTokensPage = () => {
    const { data: tokens, isLoading } = useUserApiTokensQuery();
    const deleteMutation = useUserApiTokenDeleteMutation();
    const [t] = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [newToken, setNewToken] = useState(null);

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
                <DeleteButton onClick={() => {
                    if (window.confirm(t("Are you sure you want to delete this token?"))) {
                        deleteMutation.mutate(token.id);
                    }
                }}>
                    {t("Delete")}
                </DeleteButton>
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
                <Title title="API Tokens" />
                {!showForm && <PrimaryButton onClick={() => setShowForm(true)}>{t("Create token")}</PrimaryButton>}
            </div>

            {showForm && (
                <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <ApiTokenForm
                        onSuccess={(token) => {
                            setNewToken(token);
                            setShowForm(false);
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
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
        </div>
    );
};

export default ApiTokensPage;
