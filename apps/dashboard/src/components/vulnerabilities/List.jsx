import { requestVulnerabilities } from "api/requests/vulnerabilities.js";
import { useDeleteVulnerabilityMutation } from "api/vulnerabilities.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import DeleteButton from "components/ui/buttons/Delete";
import { actionCompletedToast } from "components/ui/toast";
import useQuery from "hooks/useQuery";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateButton from "../ui/buttons/Create";
import VulnerabilityFilters from "./Filters";
import VulnerabilitiesTable from "./VulnerabilitiesTable";
import VulnerabilityTableModel from "./VulnerabilityTableModel";

const VulnerabilitiesList = () => {
    const navigate = useNavigate();
    const query = useQuery();
    let pageNumber = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const vulnerabilitiesDeleteMutation = useDeleteVulnerabilityMutation();

    const [tableModel, setTableModel] = useState(new VulnerabilityTableModel());

    const [totalCount, setTotalCount] = useState("?");
    const [numberPages, setNumberPages] = useState(1);

    const onPageChange = (pageNumber) => {
        const queryParams = new URLSearchParams();
        queryParams.set("isTemplate", "false");
        queryParams.set("page", pageNumber);
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        Object.keys(tableModel.filters).forEach(
            (key) =>
                tableModel.filters[key] !== null &&
                tableModel.filters[key].length !== 0 &&
                queryParams.append(key, tableModel.filters[key]),
        );
        const url = `/vulnerabilities?${queryParams.toString()}`;
        navigate(url);
    };

    const reloadVulnerabilities = useCallback(() => {
        setTableModel((tableModel) => ({
            ...tableModel,
            vulnerabilities: null,
        }));

        const queryParams = new URLSearchParams();
        queryParams.set("isTemplate", "false");
        queryParams.set("page", apiPageNumber);
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        Object.keys(tableModel.filters).forEach(
            (key) =>
                tableModel.filters[key] !== null &&
                tableModel.filters[key].length !== 0 &&
                queryParams.append(key, tableModel.filters[key]),
        );

        requestVulnerabilities(queryParams)
            .then((data) => {
                setNumberPages(data.pageCount);
                setTotalCount(data.totalCount);
                setTableModel((tableModel) => ({
                    ...tableModel,
                    vulnerabilities: data.data,
                }));
            });
    }, [setTableModel, apiPageNumber, tableModel.filters, tableModel.sortBy.column, tableModel.sortBy.order]);

    const onDeleteButtonClick = () => {
        vulnerabilitiesDeleteMutation.mutate(tableModel.selection, {
            onSuccess: () => {
                reloadVulnerabilities();
                setTableModel({ ...tableModel, selection: [] });
                actionCompletedToast("All selected vulnerabilities were deleted.");
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };

    const onAddVulnerabilityClick = () => {
        navigate(`/vulnerabilities/create`);
    };

    useEffect(() => {
        reloadVulnerabilities();
    }, [reloadVulnerabilities, tableModel.filters]);

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <PaginationV2 page={apiPageNumber} total={numberPages} onPageChange={onPageChange} />
                <div>
                    <NativeButtonGroup>
                        <CreateButton onClick={onAddVulnerabilityClick}>Add finding</CreateButton>
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <DeleteButton onClick={onDeleteButtonClick} disabled={!tableModel.selection.length}>
                                Delete selected
                            </DeleteButton>
                        </RestrictedComponent>
                    </NativeButtonGroup>
                </div>
            </div>
            <Title title={`Findings (${totalCount})`} />
            <VulnerabilityFilters tableModel={tableModel} tableModelSetter={setTableModel} />
            <VulnerabilitiesTable
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                reloadCallback={reloadVulnerabilities}
            />
        </>
    );
};

export default VulnerabilitiesList;
