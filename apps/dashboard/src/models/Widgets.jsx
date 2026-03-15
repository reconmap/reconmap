import ActiveProjectsWidget from "components/layout/dashboard/widgets/ActiveProjectsWidget.jsx";
import ApiHealthWidget from "components/layout/dashboard/widgets/ApiHealthWidget.jsx";
import DiscussionsWidget from "components/layout/dashboard/widgets/DiscussionsWidget.jsx";
import MyTasksWidget from "components/layout/dashboard/widgets/MyTasksWidget.jsx";
import PopularCommandsWidget from "components/layout/dashboard/widgets/PopularCommandsWidget.jsx";
import RecentActivityWidget from "components/layout/dashboard/widgets/RecentActivityWidget.jsx";
import RecentDocumentsWidget from "components/layout/dashboard/widgets/RecentDocumentsWidget.jsx";
import RecentVulnerabilitiesWidget from "components/layout/dashboard/widgets/RecentVulnerabilitiesWidget.jsx";
import ReleasesWidget from "components/layout/dashboard/widgets/ReleasesWidget.jsx";
import UserActivityStatsWidget from "components/layout/dashboard/widgets/UserActivityStatsWidget.jsx";
import VulnerabilitiesByCategoryStatsWidget from "components/layout/dashboard/widgets/VulnerabilitiesByCategoryStatsWidget.jsx";
import VulnerabilitiesByRiskStatsWidget from "components/layout/dashboard/widgets/VulnerabilitiesByRiskStatsWidget.jsx";

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
