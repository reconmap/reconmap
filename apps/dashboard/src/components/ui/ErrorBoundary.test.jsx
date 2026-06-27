import { render, screen } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "./ErrorBoundary";

const ProblematicComponent = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error("Test render error");
    }
    return <div>Normal Render</div>;
};

describe("ErrorBoundary", () => {
    // Suppress console.error in tests for expected errors
    let originalConsoleError;
    beforeAll(() => {
        originalConsoleError = console.error;
        console.error = () => {};
    });

    afterAll(() => {
        console.error = originalConsoleError;
    });

    it("renders children when no error occurs", () => {
        render(
            <ErrorBoundary>
                <ProblematicComponent shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText("Normal Render")).toBeInTheDocument();
        expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });

    it("renders fallback UI when a child throws an error", () => {
        render(
            <ErrorBoundary>
                <ProblematicComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByText("An unexpected error occurred in this section of the application.")).toBeInTheDocument();
        expect(screen.getByText(/Test render error/)).toBeInTheDocument();
    });
});
