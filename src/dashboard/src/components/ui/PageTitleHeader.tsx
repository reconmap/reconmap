import type { ReactNode } from "react";
import PageTitle from "components/ui/PageTitle";
import PageHeaders from "components/ui/PageHeaders";

interface PageTitleHeaderProps {
    title: string;
    header?: ReactNode;
    subHeader?: string;
}

const PageTitleHeader = ({ title, header = title, subHeader }: PageTitleHeaderProps) => (
    <>
        <PageTitle>{title}</PageTitle>
        <PageHeaders header={header} subHeader={subHeader} />
    </>
);

export default PageTitleHeader;
