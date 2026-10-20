import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requests = vi.hoisted(() => ({
    requestNotificationDelete: vi.fn(),
    requestNotifications: vi.fn(),
    requestNotificationsDelete: vi.fn(),
    requestNotificationsPatch: vi.fn(),
    requestPartialNotificationUpdate: vi.fn(),
}));

vi.mock("./requests/notifications", () => requests);

import { useBulkUpdateNotificationsMutation, useMarkNotificationMutation } from "./notifications";

const MarkButton = () => {
    const mutation = useMarkNotificationMutation();
    return <button onClick={() => mutation.mutate({ id: 3, status: "read" })}>mark</button>;
};

const BulkButton = () => {
    const mutation = useBulkUpdateNotificationsMutation();
    return <button onClick={() => mutation.mutate({ ids: [1, 2], status: "read" })}>bulk</button>;
};

describe("notification mutations", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        requests.requestPartialNotificationUpdate.mockResolvedValue(new Response(null, { status: 204 }));
        requests.requestNotificationsPatch.mockResolvedValue(new Response(null, { status: 204 }));
        queryClient = new QueryClient();
    });

    it("invalidates every notifications query after marking one notification", async () => {
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        render(
            <QueryClientProvider client={queryClient}>
                <MarkButton />
            </QueryClientProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "mark" }));

        await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["system-notifications"] }));
        expect(requests.requestPartialNotificationUpdate).toHaveBeenCalledWith(3, { status: "read" });
    });

    it("invalidates every notifications query after a bulk update", async () => {
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        render(
            <QueryClientProvider client={queryClient}>
                <BulkButton />
            </QueryClientProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "bulk" }));

        await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["system-notifications"] }));
        expect(requests.requestNotificationsPatch).toHaveBeenCalledWith({ ids: [1, 2], status: "read" });
    });
});
