import type { ReactNode } from "react";

interface PageHeadersProps {
    header: ReactNode;
    subHeader?: string;
}

const PageHeaders = ({ header, subHeader }: PageHeadersProps) => (
    <div className="mb-5">
        {subHeader && <p className="subtitle">{subHeader}</p>}
        <h1 className="title">{header}</h1>
    </div>
);

export default PageHeaders;
