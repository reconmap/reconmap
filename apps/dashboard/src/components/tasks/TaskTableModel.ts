interface Props {
    columnsVisibility: { [key: string]: boolean };
    pageNumber: number;
    selection: string[];
    tasks?: object[];
    filters: object;
    sortBy: object;
}

class TaskTableModel implements Props {
    pageNumber: number = 0;
    columnsVisibility: { [key: string]: boolean } = {
        selection: false,
        project: true,
    };
    selection: string[] = [];
    tasks?: object[] = [];
    filters: object = {
        projectId: null,
        priority: null,
        status: null,
    };
    sortBy: object = { column: "createdAt", order: "DESC" };

    constructor(isSelectionColumnVisible: boolean = false, isProjectColumnVisible: boolean = true) {
        this.columnsVisibility.selection = isSelectionColumnVisible;
        this.columnsVisibility.project = isProjectColumnVisible;
    }
}

export default TaskTableModel;
