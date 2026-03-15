// useTheme.ts
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme(): { theme: Theme; toggleTheme: () => void; setTheme: (newTheme: Theme) => void } {
    // Initialize theme with localStorage or default to "light"
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "light" || savedTheme === "dark" ? (savedTheme as Theme) : "light";
    });

    useEffect(() => {
        // Apply the theme to the document element and save to localStorage
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Toggle between light and dark themes
    const toggleTheme = () => {
        setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    // Explicitly set the theme
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return { theme, toggleTheme, setTheme };
}
