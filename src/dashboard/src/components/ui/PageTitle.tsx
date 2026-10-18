const PageTitle = ({ children }: { children?: string }) => <title>{children ? `${children} | Reconmap` : "Reconmap"}</title>;

export default PageTitle;
