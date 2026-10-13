import ActiveProjectsWidget from "pages/dashboard/widgets/ActiveProjectsWidget";
import ApiHealthWidget from "pages/dashboard/widgets/ApiHealthWidget";
import DiscussionsWidget from "pages/dashboard/widgets/DiscussionsWidget";
import MyTasksWidget from "pages/dashboard/widgets/MyTasksWidget";
import RecentActivityWidget from "pages/dashboard/widgets/RecentActivityWidget";
import RecentVulnerabilitiesWidget from "pages/dashboard/widgets/RecentVulnerabilitiesWidget";
import ReleasesWidget from "pages/dashboard/widgets/ReleasesWidget";
import UserActivityStatsWidget from "pages/dashboard/widgets/UserActivityStatsWidget";
import VulnerabilitiesByCategoryStatsWidget from "pages/dashboard/widgets/VulnerabilitiesByCategoryStatsWidget";
import VulnerabilitiesByRiskStatsWidget from "pages/dashboard/widgets/VulnerabilitiesByRiskStatsWidget";
import RunnersWidget from "pages/dashboard/widgets/RunnersWidget";
import TopVulnerableAssetsWidget from "pages/dashboard/widgets/TopVulnerableAssetsWidget";

const Widgets = {
    "discussions": {
        title: "Community discussions",
        description: "Recent community discussions",
        visible: true,
        component: <DiscussionsWidget />,
    },
    "releases": {
        title: "Reconmap releases",
        description: "Recent Reconmap releases",
        visible: true,
        component: <ReleasesWidget />,
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
    "runners": {
        title: "Runners",
        visible: true,
        component: <RunnersWidget />,
        description: "It shows the status of security runners.",
    },
    "top-vulnerable-assets": {
        title: "Top vulnerable assets",
        visible: true,
        component: <TopVulnerableAssetsWidget />,
        description: "It shows assets with the highest count of active vulnerabilities.",
    },
};

export default Widgets;
