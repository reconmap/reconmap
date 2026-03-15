import { useQuery } from "@tanstack/react-query";
import { requestDiscussions, requestReleases } from "./requests/community.js";

export const useReleasesQuery = () => {
    return useQuery({
        queryKey: ["releases"],
        queryFn: () => requestReleases().then((res) => res.json()),
    });
};

export const useDiscussionsQuery = () => {
    return useQuery({
        queryKey: ["discussions"],
        queryFn: () => requestDiscussions().then((res) => res.json())
            .then(json => json.filter((d: any) => d.category.name === 'Announcements')
                .sort(
                    (a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )),
    });
};
