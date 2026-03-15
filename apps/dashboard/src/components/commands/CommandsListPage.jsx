import { useCommandsQuery } from "api/commands.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import PaginationV2 from "components/layout/PaginationV2";
import CreateButton from "components/ui/buttons/Create";
import Loading from "components/ui/Loading.jsx";
import ExportMenuItem from "components/ui/menuitems/ExportMenuItem";
import Title from "components/ui/Title";
import useQuery from "hooks/useQuery";
import { useNavigate } from "react-router-dom";
import CommandsTable from "./Table.jsx";

const CommandsListPage = () => {
    const navigate = useNavigate();
    const query = useQuery();
    let pageNumber = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const { data: commands, isLoading } = useCommandsQuery({ limit: 10, page: apiPageNumber });

    const onAddCommandClick = (ev) => {
        ev.preventDefault();

        navigate("/commands/add");
    };

    const onPageChange = (pageNumber) => {
        const queryParams = new URLSearchParams();
        queryParams.set("page", pageNumber + 1);
        const url = `/commands?${queryParams.toString()}`;
        navigate(url);
    };

    if (isLoading) return <Loading />;

    return (
        <div>
            <div className="heading">
                <PaginationV2 page={apiPageNumber} total={commands.pageCount} onPageChange={onPageChange} />

                <NativeButtonGroup>
                    <CreateButton onClick={onAddCommandClick}>Add command</CreateButton>
                    <ExportMenuItem entity="commands" />
                </NativeButtonGroup>
            </div>
            <Title title={`Commands (${commands.totalCount})`} />
            <CommandsTable commands={commands.data} />
        </div>
    );
};

export default CommandsListPage;
