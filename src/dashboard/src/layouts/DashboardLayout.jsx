import KeyboardShortcuts from "components/support/KeyboardShortcuts";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import ErrorBoundary from "components/ui/ErrorBoundary.jsx";

const DashboardLayout = () => {
    return (
        <>
            <Header />
            <div>
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </div>
            <KeyboardShortcuts />
        </>
    );
};

export default DashboardLayout;
