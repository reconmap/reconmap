import cn from "translations/cn/application.json";
import en from "translations/en/application.json";
import es from "translations/es/application.json";
import fr from "translations/fr/application.json";

const locales: Record<string, Record<string, string>> = { en, es, fr, cn };

// Keys rendered by the catalog-backed model selector on the AI settings page.
const modelSelectorKeys = [
    "Select a model",
    "Loading models…",
    "Refresh models",
    "Live catalog: {{count}} models",
    "Live discovery unavailable — showing the verified fallback catalog.",
    "No chat-capable models are available for this account.",
    "Unable to load the model catalog.",
    "The previously selected model is no longer available. Select a model.",
    "Search models",
    "No matching models.",
];

it.each(Object.keys(locales))("translates every model selector key in %s", (locale) => {
    for (const key of modelSelectorKeys) {
        expect(locales[locale][key]).toEqual(expect.any(String));
        expect(locales[locale][key].length).toBeGreaterThan(0);
    }
    // i18next interpolation placeholders must survive translation.
    expect(locales[locale]["Live catalog: {{count}} models"]).toContain("{{count}}");
});
