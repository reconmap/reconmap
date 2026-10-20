# AI Agent Guide: Reconmap Dashboard

This file applies when working in `src/dashboard/`, the React web frontend for Reconmap. The repository-wide rules in the root `AGENTS.md` also apply, including the feature completion gate (tests, docs, changelog). The frontend development guidelines are in [CONTRIBUTING.md](CONTRIBUTING.md). Read it before making non-trivial changes.

## Stack

- React with function components only, TypeScript, Vite.
- Bulma for styling, with CSS modules or scoped styles.
- Vitest for tests, oxlint for linting, stylelint for CSS, knip for unused code.
- Node version is pinned in `.nvmrc`.

## Commands

Run these from `src/dashboard/`.

| Purpose | Command |
| --- | --- |
| Lint TypeScript/TSX | `npm run lint` (runs `oxlint src`) |
| Lint CSS | `npx stylelint "**/*.css"` |
| Tests | `npm test` (runs `vitest run`) |
| Type check and build | `npm run build` (runs `tsc && vite build`) |
| Unused code | `npm run knip` |
| Dev server | `npm start` (port 5500) |

The Docker-based equivalents are `make lint` and `make tests`, which also run stylelint.

## Required checks after every change

After editing any file under `src/dashboard/`:

1. Run `npm run lint` and `npx stylelint "**/*.css"`. Fix every error you introduced. Do not leave new warnings in code you touched.
2. Run `npm test` if you changed logic, components, or hooks that have tests, or if you added new behaviour that should have tests.
3. Run `npm run build` before considering a task done, because it type-checks the whole project (`tsc`).

Report the results in your final response. If a check fails for a reason outside your change, say so and show the output.

## Code rules

- Use native HTML elements (`button`, `input`, `table`) before custom components or libraries.
- Type API responses and shared data structures explicitly. Avoid complex type-level logic.
- Keep state local. Derive values instead of storing them. Avoid global state unless it is clearly needed.
- Lazy-load routes and heavy components (charts, tables, editors).
- Re-use existing components in `src/components/` before creating new ones. Do not create components prematurely.
- Do not add a dependency without checking whether the browser platform or a small utility can do the job. Every dependency must justify its bundle size.
- Accessibility matters. The lint config enforces `jsx-a11y` rules: interactive elements need labels and keyboard handlers.

## Files to leave alone

- `node_modules/` and `build/` (generated output).
- `public/config.json` (the Makefile mounts `config.local.json` here at runtime; edit the source config, not the copy).

## Documentation

- User-facing docs live in the root `docs/` directory, not here. Update them when you change behaviour, configuration, or usage.
- Update `README.md` in this directory only when the way to run or develop the dashboard changes.
