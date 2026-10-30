import ActiveProjectsWidget from "components/dashboard/widgets/ActiveProjectsWidget";
import DiscussionsWidget from "components/dashboard/widgets/DiscussionsWidget";
import MyTasksWidget from "components/dashboard/widgets/MyTasksWidget";
import RecentActivityWidget from "components/dashboard/widgets/RecentActivityWidget";
import RecentFindingsWidget from "components/dashboard/widgets/RecentFindingsWidget";
import ReleasesWidget from "components/dashboard/widgets/ReleasesWidget";
import UserActivityStatsWidget from "components/dashboard/widgets/UserActivityStatsWidget";
import FindingsByCategoryStatsWidget from "components/dashboard/widgets/FindingsByCategoryStatsWidget";
import FindingsByRiskStatsWidget from "components/dashboard/widgets/FindingsByRiskStatsWidget";
import SystemHealthWidget from "components/dashboard/widgets/SystemHealthWidget";
import SystemUsageWidget from "components/dashboard/widgets/SystemUsageWidget";
import RunnersWidget from "components/dashboard/widgets/RunnersWidget";
import TopAssetsByFindingsWidget from "components/dashboard/widgets/TopAssetsByFindingsWidget";

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
    "finding-by-risk-stats": {
        title: "Finding by risk",
        description: "It charts findings grouped by risk level.",
        visible: true,
        component: <FindingsByRiskStatsWidget />,
    },
    "active-projects": {
        title: "Active projects",
        visible: true,
        component: <ActiveProjectsWidget />,
        description: "It shows up to five active projects.",
    },

    "finding-by-category-stats": {
        title: "Finding by category",
        description: "It charts findings grouped by category.",
        visible: true,
        component: <FindingsByCategoryStatsWidget />,
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
    "recent-findings": {
        title: "Recent findings",
        visible: true,
        component: <RecentFindingsWidget />,
        description: "It shows the five most recently reported findings.",
    },
    "runners": {
        title: "Runners",
        visible: true,
        component: <RunnersWidget />,
        description: "It shows each registered runner with its operating system, IP and whether it is online.",
    },
    "top-assets-by-findings": {
        title: "Top assets by findings",
        visible: true,
        component: <TopAssetsByFindingsWidget />,
        description: "It shows the five assets with the most findings, based on the 100 latest non-template findings.",
    },
};

export default Widgets;
