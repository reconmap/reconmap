import { useEffect } from "react";

function useDocumentTitle(title: string): void {
    useEffect(() => {
        document.title = title ? `${title} | Reconmap` : "Reconmap";
    }, [title]);
}

export default useDocumentTitle;
