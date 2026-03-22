import ActiveProjectsWidget from "pages/dashboard/widgets/ActiveProjectsWidget.jsx";
import ApiHealthWidget from "pages/dashboard/widgets/ApiHealthWidget.jsx";
import DiscussionsWidget from "pages/dashboard/widgets/DiscussionsWidget.jsx";
import MyTasksWidget from "pages/dashboard/widgets/MyTasksWidget.jsx";
import PopularCommandsWidget from "pages/dashboard/widgets/PopularCommandsWidget.jsx";
import RecentActivityWidget from "pages/dashboard/widgets/RecentActivityWidget.jsx";
import RecentDocumentsWidget from "pages/dashboard/widgets/RecentDocumentsWidget.jsx";
import RecentVulnerabilitiesWidget from "pages/dashboard/widgets/RecentVulnerabilitiesWidget.jsx";
import ReleasesWidget from "pages/dashboard/widgets/ReleasesWidget.jsx";
import UserActivityStatsWidget from "pages/dashboard/widgets/UserActivityStatsWidget.jsx";
import VulnerabilitiesByCategoryStatsWidget from "pages/dashboard/widgets/VulnerabilitiesByCategoryStatsWidget.jsx";
import VulnerabilitiesByRiskStatsWidget from "pages/dashboard/widgets/VulnerabilitiesByRiskStatsWidget.jsx";

const Widgets = {
    "discussions": {
        title: "Community discussions",
        description: "Recent Reconmap releases",
        visible: true,
        component: <ReleasesWidget />,
    },
    "releases": {
        title: "Reconmap releases",
        description: "Recent community discussions",
        visible: true,
        component: <DiscussionsWidget />,
    },
    "my-tasks": {
        title: "My tasks",
        description: "It shows a list of all open tasks assigned to you.",
        visible: true,
        component: <MyTasksWidget />,
    },
    "vulnerability-by-risk-stats": {
        title: "Vulnerability by risk",
        visible: true,
        component: <VulnerabilitiesByRiskStatsWidget />,
    },
    "active-projects": {
        title: "Active projects",
        visible: true,
        component: <ActiveProjectsWidget />,
        description: "It shows a list of all non-archived projects.",
    },
    "popular-commands": {
        title: "Popular commands",
        visible: true,
        component: <PopularCommandsWidget />,
        permissions: "commands.",
    },
    "recent-documents": {
        title: "Recent documents",
        visible: true,
        component: <RecentDocumentsWidget />,
        description: "It shows a list of the most recent documents.",
        permissions: "documents.*",
    },
    "vulnerability-by-category-stats": {
        title: "Vulnerability by category",
        visible: true,
        component: <VulnerabilitiesByCategoryStatsWidget />,
    },
    "recent-activity": {
        title: "Recent activity",
        visible: true,
        component: <RecentActivityWidget />,
        permissions: "system.*",
    },
    "user-activity-stats": {
        title: "User activity over time",
        visible: true,
        component: <UserActivityStatsWidget />,
        permissions: "system.*",
    },
    "api-health": {
        title: "API health",
        visible: true,
        component: <ApiHealthWidget />,
        description: "It presents information about the health of the API server.",
        permissions: "system.*",
    },
    "recent-vulnerabilities": {
        title: "Recent vulnerabilities",
        visible: true,
        component: <RecentVulnerabilitiesWidget />,
        description: "It shows the most recently reported vulnerabilities.",
    },
};

export default Widgets;
