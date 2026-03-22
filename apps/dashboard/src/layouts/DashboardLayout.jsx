import KeyboardShortcuts from "components/support/KeyboardShortcuts";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header.jsx";

const DashboardLayout = () => {
    return (
        <>
            <Header />
            <div>
                <Outlet />
            </div>
            <KeyboardShortcuts />
        </>
    );
};

export default DashboardLayout;
