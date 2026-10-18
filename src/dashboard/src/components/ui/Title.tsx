import PageTitle from "components/ui/PageTitle";

const Title = ({ type, title, documentTitle = "double" }: any) => {
    return (
        <div className="mb-5">
            {documentTitle != "none" && <PageTitle>{documentTitle == "single" || !type ? title : `${title} (${type})`}</PageTitle>}
            {type && <h2 className="subtitle">{type}</h2>}
            <h1 className="title">{title}</h1>
        </div>
    );
};

export default Title;
