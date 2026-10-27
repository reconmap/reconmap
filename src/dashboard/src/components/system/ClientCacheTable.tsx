import { useQueryClient } from "@tanstack/react-query";
import NativeButton from "components/forms/NativeButton";
import { useTranslation } from "react-i18next";

const ClientCacheTable = () => {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const queries = queryClient.getQueryCache().getAll();

  return (
    <>
      <p className="mb-4">
        <NativeButton onClick={() => queryClient.invalidateQueries()}>
          {t("Invalidate all queries")}
        </NativeButton>
      </p>
      {queries.length === 0 ? (
        <p>{t("No queries are cached.")}</p>
      ) : (
        <table className="table is-stripped is-fullwidth">
          <thead>
            <tr>
              <th>{t("Query key")}</th>
              <th>{t("Status")}</th>
              <th>{t("Observers")}</th>
              <th>{t("Last updated")}</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((query) => (
              <tr key={query.queryHash}>
                <td>
                  <code>{JSON.stringify(query.queryKey)}</code>
                </td>
                <td>
                  {query.isStale() ? t("Stale") : t("Fresh")}
                  {query.isActive() ? `, ${t("active")}` : ""}
                </td>
                <td>{query.getObserversCount()}</td>
                <td>
                  {query.state.dataUpdatedAt
                    ? new Date(query.state.dataUpdatedAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default ClientCacheTable;
