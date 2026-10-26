import "./TaskProgress.css";

interface Props {
    completed: number;
    total: number;
}

// Native progress element. The total must be above zero: a max of zero makes the bar indeterminate.
const TaskProgress = ({ completed, total }: Props) => {
    const label = `${completed} of ${total} tasks completed`;

    return (
        <progress
            className="progress is-small is-success task-progress"
            value={completed}
            max={total}
            title={label}
            aria-label={label}
        />
    );
};

export default TaskProgress;
