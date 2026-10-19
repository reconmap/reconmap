import ActiveProjectsWidget from "pages/dashboard/widgets/ActiveProjectsWidget";
import DiscussionsWidget from "pages/dashboard/widgets/DiscussionsWidget";
import MyTasksWidget from "pages/dashboard/widgets/MyTasksWidget";
import RecentActivityWidget from "pages/dashboard/widgets/RecentActivityWidget";
import RecentVulnerabilitiesWidget from "pages/dashboard/widgets/RecentVulnerabilitiesWidget";
import ReleasesWidget from "pages/dashboard/widgets/ReleasesWidget";
import UserActivityStatsWidget from "pages/dashboard/widgets/UserActivityStatsWidget";
import VulnerabilitiesByCategoryStatsWidget from "pages/dashboard/widgets/VulnerabilitiesByCategoryStatsWidget";
import VulnerabilitiesByRiskStatsWidget from "pages/dashboard/widgets/VulnerabilitiesByRiskStatsWidget";
import SystemHealthWidget from "pages/dashboard/widgets/SystemHealthWidget";
import SystemUsageWidget from "pages/dashboard/widgets/SystemUsageWidget";
import RunnersWidget from "pages/dashboard/widgets/RunnersWidget";
import TopVulnerableAssetsWidget from "pages/dashboard/widgets/TopVulnerableAssetsWidget";

const Widgets = {
    "discussions": {
        title: "Community discussions",
        description: "It shows the latest Reconmap community discussions.",
        visible: true,
        component: <DiscussionsWidget />,
    },
    "releases": {
        title: "Reconmap releases",
        description: "It shows the latest Reconmap releases.",
        visible: true,
        component: <ReleasesWidget />,
    },
    "my-tasks": {
        title: "My tasks",
        description: "It shows up to five tasks assigned to you in non-archived projects.",
        visible: true,
        component: <MyTasksWidget />,
    },
    "vulnerability-by-risk-stats": {
        title: "Vulnerability by risk",
        description: "It charts vulnerabilities grouped by risk level.",
        visible: true,
        component: <VulnerabilitiesByRiskStatsWidget />,
    },
    "active-projects": {
        title: "Active projects",
        visible: true,
        component: <ActiveProjectsWidget />,
        description: "It shows up to five active projects.",
    },

    "vulnerability-by-category-stats": {
        title: "Vulnerability by category",
        description: "It charts vulnerabilities grouped by category.",
        visible: true,
        component: <VulnerabilitiesByCategoryStatsWidget />,
    },
    "recent-activity": {
        title: "Recent activity",
        description: "It shows the ten latest actions performed by users across the system.",
        visible: true,
        component: <RecentActivityWidget />,
        permissions: "system.*",
    },
    "user-activity-stats": {
        title: "User activity",
        description: "Heatmap of user actions recorded per day over the last 20 weeks.",
        visible: true,
        component: <UserActivityStatsWidget />,
        permissions: "system.*",
    },
    "system-health": {
        title: "System health",
        visible: true,
        component: <SystemHealthWidget />,
        description: "It shows the health of the API, its backing services and the MCP server.",
        permissions: "system.*",
    },
    "system-usage": {
        title: "System usage",
        visible: true,
        component: <SystemUsageWidget />,
        description: "It shows AI usage and cost, attachments storage, key-value server memory and message queue depth.",
        permissions: "system.*",
    },
    "recent-vulnerabilities": {
        title: "Recent vulnerabilities",
        visible: true,
        component: <RecentVulnerabilitiesWidget />,
        description: "It shows the five most recently reported vulnerabilities.",
    },
    "runners": {
        title: "Runners",
        visible: true,
        component: <RunnersWidget />,
        description: "It shows each registered runner with its operating system, IP and whether it is online.",
    },
    "top-vulnerable-assets": {
        title: "Top vulnerable assets",
        visible: true,
        component: <TopVulnerableAssetsWidget />,
        description: "It shows the five assets with the most vulnerabilities, based on the 100 latest non-template vulnerabilities.",
    },
};

export default Widgets;
