import i18next from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import APP_TRANSLATIONS_CN from "translations/cn/application.json";
import COMMON_TRANSLATIONS_CN from "translations/cn/common.json";
import APP_TRANSLATIONS_EN from "translations/en/application.json";
import COMMON_TRANSLATIONS_EN from "translations/en/common.json";
import APP_TRANSLATIONS_ES from "translations/es/application.json";
import COMMON_TRANSLATIONS_ES from "translations/es/common.json";
import APP_TRANSLATIONS_FR from "translations/fr/application.json";
import COMMON_TRANSLATIONS_FR from "translations/fr/common.json";
import APP_TRANSLATIONS_PT from "translations/pt/application.json";
import COMMON_TRANSLATIONS_PT from "translations/pt/common.json";
import APP_TRANSLATIONS_DE from "translations/de/application.json";
import COMMON_TRANSLATIONS_DE from "translations/de/common.json";


i18next
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        ns: ["app", "common"],
        defaultNS: "app",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        resources: {
            en: {
                app: APP_TRANSLATIONS_EN,
                common: COMMON_TRANSLATIONS_EN,
            },
            es: {
                app: APP_TRANSLATIONS_ES,
                common: COMMON_TRANSLATIONS_ES,
            },
            pt: {
                app: APP_TRANSLATIONS_PT,
                common: COMMON_TRANSLATIONS_PT,
            },
            cn: {
                app: APP_TRANSLATIONS_CN,
                common: COMMON_TRANSLATIONS_CN,
            },
            fr: {
                app: APP_TRANSLATIONS_FR,
                common: COMMON_TRANSLATIONS_FR,
            },
            de: {
                app: APP_TRANSLATIONS_DE,
                common: COMMON_TRANSLATIONS_DE,
            }
        },
    });
