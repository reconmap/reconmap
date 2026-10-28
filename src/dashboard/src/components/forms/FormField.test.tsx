import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Form from "./Form";
import FormField from "./FormField";

const field = (layout?: "horizontal" | "vertical") => <FormField label="Name" htmlFor="name" layout={layout} control={<input id="name" />} />;

describe("FormField", () => {
    it("is vertical by default", () => {
        const { container } = render(<Form>{field()}</Form>);
        expect(container.querySelector(".is-horizontal")).toBeNull();
    });

    it("inherits the horizontal layout from Form", () => {
        const { container } = render(<Form layout="horizontal">{field()}</Form>);
        expect(container.querySelector(".field.is-horizontal")).not.toBeNull();
    });

    it("lets a field override the form layout", () => {
        const { container } = render(<Form layout="horizontal">{field("vertical")}</Form>);
        expect(container.querySelector(".is-horizontal")).toBeNull();
    });
});
