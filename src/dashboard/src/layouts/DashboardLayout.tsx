import KeyboardShortcuts from "components/support/KeyboardShortcuts";
import { Outlet } from "react-router";
import Header from "../components/layout/Header";
import ErrorBoundary from "components/ui/ErrorBoundary";

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
