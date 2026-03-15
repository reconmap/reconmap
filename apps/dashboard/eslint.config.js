import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

const compat = new FlatCompat({
    baseDirectory: new URL('.', import.meta.url).pathname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        extends: fixupConfigRules(
            compat.extends(
                "eslint:recommended",
                "plugin:react/recommended",
                "plugin:react-hooks/recommended",
                "plugin:import/recommended",
                "plugin:jsx-a11y/recommended",
                "plugin:@typescript-eslint/recommended",
                "eslint-config-prettier",
            ),
        ),

        plugins: {
            "react-hooks": fixupPluginRules(reactHooks),
        },

        settings: {
            react: { version: "detect" },
            "import/resolver": {
                node: {
                    paths: ["src"],
                    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
                },
                typescript: {
                    project: ["./tsconfig.json"],
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                    alwaysTryTypes: true,
                },
            },
        },

        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "import/no-anonymous-default-export": "warn",
            "import/no-unresolved": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            "no-prototype-builtins": "error",
            "no-undef": "warn",
            "no-unused-vars": "warn",
            "prefer-const": "error",
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/rules-of-hooks": "warn",
            "react/display-name": "warn",
            "react/jsx-key": "warn",
            "react/prop-types": "warn",
            "react/react-in-jsx-scope": "warn",
            eqeqeq: "warn",
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    globalIgnores(["**/node_modules", "**/build", "coverage**"]),
]);
