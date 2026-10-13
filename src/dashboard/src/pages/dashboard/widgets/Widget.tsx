import "./DashboardWidget.css";

const DashboardWidget = ({ title, children }: any) => {
    return (
        <div className="card dashboard-widget">
            <header className="card-header">
                <p className="card-header-title">{title}</p>
            </header>
            <div className="card-content">{children}</div>
        </div>
    );
};

export default DashboardWidget;
