import type { ReactNode } from "react";

interface PageHeadersProps {
    header: ReactNode;
    subHeader?: string;
}

const PageHeaders = ({ header, subHeader }: PageHeadersProps) => (
    <div className="mb-5">
        {subHeader && <h2 className="subtitle">{subHeader}</h2>}
        <h1 className="title">{header}</h1>
    </div>
);

export default PageHeaders;
