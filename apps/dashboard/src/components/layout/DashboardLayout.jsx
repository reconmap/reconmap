import KeyboardShortcuts from "components/support/KeyboardShortcuts";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";

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
