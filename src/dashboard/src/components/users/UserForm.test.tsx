import { render } from "@testing-library/react";
import UserForm from "./UserForm";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ i18n: { changeLanguage: vi.fn() } }),
}));

const renderForm = (user: any) => {
    const { container } = render(<UserForm user={user} userSetter={vi.fn()} onFormSubmit={vi.fn()} />);
    return {
        firstName: container.querySelector<HTMLInputElement>("#firstName")!,
        lastName: container.querySelector<HTMLInputElement>("#lastName")!,
        username: container.querySelector<HTMLInputElement>("#username")!,
    };
};

it.each(["Mary", "Mary Ann", "O'Brien", "Smith-Jones", "Jr."])("accepts the plain name %s", (name) => {
    const { firstName, lastName } = renderForm({ firstName: name, lastName: name });

    expect(firstName.checkValidity()).toBe(true);
    expect(lastName.checkValidity()).toBe(true);
});

it.each(["(n/a)", "Ana/Maria", "Bob<script>", "Jo_hn", "Zoë", "x@y"])("rejects the name %s", (name) => {
    const { firstName, lastName } = renderForm({ firstName: name, lastName: name });

    expect(firstName.checkValidity()).toBe(false);
    expect(lastName.checkValidity()).toBe(false);
    expect(lastName.title).toContain("Only letters");
});

it.each(["jdoe", "john.doe", "john_doe-2"])("accepts the plain username %s", (username) => {
    const { username: input } = renderForm({ username });

    expect(input.checkValidity()).toBe(true);
});

it.each(["(n/a)", "john doe", "jo/hn", "jöhn", "john@example.com"])("rejects the username %s", (username) => {
    const { username: input } = renderForm({ username });

    expect(input.checkValidity()).toBe(false);
    expect(input.title).toContain("Only letters, numbers");
});

it("disables the role select when users edit their own account", () => {
    const { container } = render(<UserForm isEdit isOwner user={{ role: "user" }} userSetter={vi.fn()} onFormSubmit={vi.fn()} />);

    expect(container.querySelector<HTMLSelectElement>("#role")!.disabled).toBe(true);
});

it("lets administrators change the role of other users", () => {
    const { container } = render(<UserForm isEdit user={{ role: "user" }} userSetter={vi.fn()} onFormSubmit={vi.fn()} />);

    expect(container.querySelector<HTMLSelectElement>("#role")!.disabled).toBe(false);
});
