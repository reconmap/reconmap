interface Props {
    pageNumber: number;
    selection: string[];
    findings?: any;
    filters: any;
    sortBy: any;
}

class FindingTableModel implements Props {
    pageNumber: number = 0;
    selection: string[] = [];
    findings?: any = [];
    filters: any = {
        projectId: null,
        categoryId: null,
        risk: null,
        status: null,
    };
    sortBy: any = { column: "createdAt", order: "DESC" };
}

export default FindingTableModel;
