import useDocumentTitle from "hooks/useDocumentTitle";

const Title = ({ type, title, documentTitle = "double" }: any) => {
    if (documentTitle != "none") {
        useDocumentTitle(documentTitle == "single" || !type ? title : `${title} (${type})`);
    }

    return (
        <div className="mb-5">
            {type && <h2 className="subtitle">{type}</h2>}
            <h1 className="title">{title}</h1>
        </div>
    );
};

export default Title;
