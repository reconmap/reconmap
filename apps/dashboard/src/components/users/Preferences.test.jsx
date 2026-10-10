vi.mock("react-i18next", () => ({
    useTranslation: () => ({ i18n: { changeLanguage: vi.fn() } }),
}));

import { render, screen } from "@testing-library/react";
import UserPreferences from "./Preferences";

const values = { language: "es", theme: "light", timezone: "Europe/Madrid" };

it("shows language, theme and timezone read-only to someone who is not the owner", () => {
    const { container } = render(<UserPreferences isOwner={false} values={values} onChange={vi.fn()} />);

    expect(container.querySelector("select")).toBeNull();
    expect(container.textContent).toContain("Spanish");
    expect(container.textContent).toContain("Light");
    expect(container.textContent).toContain("Europe/Madrid");
});

it("lets the owner of the profile change language, theme and timezone", () => {
    const { container } = render(<UserPreferences isOwner={true} values={values} onChange={vi.fn()} />);

    const selects = container.querySelectorAll("select");
    expect(selects).toHaveLength(3);
    expect(selects[0].name).toBe("language");
    expect(selects[0].value).toBe("es");
    expect(selects[1].name).toBe("theme");
    expect(selects[1].value).toBe("light");
    expect(selects[2].name).toBe("timezone");
    expect(selects[2].value).toBe("Europe/Madrid");
    expect(screen.queryByText("Only this user can change their preferences.")).toBeNull();
});
