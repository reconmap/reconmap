import type { ReactNode } from "react";

interface TabToolbarProps {
    start?: ReactNode;
    end?: ReactNode;
}

const TabToolbar = ({ start, end }: TabToolbarProps) => (
    <div className="is-flex is-flex-wrap-wrap is-justify-content-space-between is-align-items-center is-gap-2 mb-4">
        <div className="is-flex is-flex-wrap-wrap is-align-items-center is-gap-2">{start}</div>
        <div className="is-flex is-flex-wrap-wrap is-align-items-center is-gap-2 ml-auto">{end}</div>
    </div>
);

export default TabToolbar;
