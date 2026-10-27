# Contributing to Reconmap Dashboard

Thank you for contributing to the Reconmap dashboard.

This document defines the **frontend development guidelines** for the dashboard application.

---

## Goal

The dashboard prioritises:

* **Performance**
* **Responsiveness**
* **User productivity**

We explicitly **do not optimise for flashy visuals or unnecessary complexity**.

The dashboard is a **data-heavy interface**, so clarity, speed, and predictability are critical.

---

## Core Principles

* **Prefer the platform over abstractions**
  Use built-in browser features before adding libraries.

* **Ship less JavaScript**
  Every dependency and abstraction increases bundle size and runtime cost.

* **Optimise for fast interaction**
  The UI should feel immediate and responsive at all times.

* **Keep things simple and obvious**
  Code should be easy to understand without deep context.

* **Avoid unnecessary complexity**
  No abstraction without a clear, proven benefit.

---

## General Rules

### HTML

* Use **native HTML elements** (`button`, `input`, `table`, etc.)
* Prefer built-in browser behaviour over custom JavaScript
* Maintain semantic structure for accessibility

---

### CSS

* Use **modern CSS** (variables, flexbox, grid)
* Use **CSS modules or scoped styles**
* Prefer **CSS classes over inline styles**
* Avoid preprocessors (e.g. Sass) unless already required
* Avoid CSS-in-JS and runtime styling solutions

---

### TypeScript

* Use **TypeScript everywhere**
* Prefer **simple and explicit types**
* Avoid overly complex type logic
* Always type:

  * API responses
  * shared data structures

---

### React

* Use **function components only**

* Keep components:

  * small
  * focused
  * easy to read

* Avoid:

  * deep component trees
  * unnecessary abstraction layers
  * overuse of custom hooks

* Prefer:

  * local state over global state
  * derived state over duplicated state

---

### State & Data

* Keep state **as local as possible**
* Avoid global state unless clearly necessary
* Do not store derived values
* Avoid duplicate API calls (cache where appropriate)

#### Cancelling requests

Read requests must be cancellable so a slow, stale response never overwrites a newer one or updates an unmounted component.

* Every `request*` function that reads data takes an optional `init?: RequestInit` as its last argument and forwards it to `secureApiFetch` (`requestEntity`, `requestEntities` and `requestEntityPost` do the same).
* In `useQuery`, pass the signal TanStack provides: `queryFn: ({ signal }) => requestX(id, { signal })`. Do not do this in `useMutation`: aborting a write does not undo it on the server.
* In a `useEffect` that fetches, create an `AbortController`, pass `controller.signal`, return `() => controller.abort()` and end the chain with `.catch(ignoreAbortError)` from `utilities/abort`.
* Do not pass a fetch function straight to an `onClick`: the click event would be received as the `signal`. Wrap it: `onClick={() => fetchX()}`.
* Long operations started by the user (uploads, imports) keep their controller in a ref, abort it on unmount and offer a Cancel button while they run (see `AttachmentsDropzone` and `ImportForm`).
* WebSockets and `EventSource` do not take a signal: close them, and clear any reconnect timer, in the effect cleanup.

---

### Performance

* Lazy-load:

  * routes
  * heavy components (charts, tables, editors)

* Avoid:

  * large dependencies
  * unnecessary re-renders
  * expensive logic inside render

* Use memoization only when it provides measurable benefit

---

### Components

* Do not create components prematurely
* Re-use existing components (`<Native* />`)

* Extract components only when:

  * reused multiple times
  * logic becomes complex

* Prefer **composition over abstraction**

---

### Dependencies

* Every dependency must justify:

  * its **bundle size**
  * its **runtime cost**

Before adding a dependency:

* Check if native browser APIs can solve the problem
* Consider writing a small utility instead

---

### UI / UX (Dashboard-Specific)

* Prioritise:

  * readability of data
  * fast scanning of information
  * low interaction cost

* Avoid:

  * heavy animations
  * unnecessary transitions
  * cluttered layouts

* Tables and widgets must:

  * render quickly
  * handle large datasets efficiently

---

### Codebase

* Keep structure **flat and predictable**
* Avoid deep folder nesting
* Remove unused code regularly
* Prefer clarity over cleverness

#### Pages vs components

* `src/pages/` holds only routable views and their `*Routes.tsx` route tables.
  Every view file must be referenced by a route.
* `src/components/` holds reusable UI, including dashboard widgets. Components never import from `pages/`.
* Layouts live in `src/layouts/`, contexts in `src/contexts/`, and hooks in `src/hooks/`.

#### Naming

* A file's name matches the name of its default export (`ProjectsTable.tsx` exports `ProjectsTable`).
* Routed views are named `<Feature><Action>Page.tsx`, for example `ProjectsListPage`, `ProjectCreatePage`,
  `ProjectDetailsPage` and `ProjectEditPage`. Use `Create` (not `Creation`) and `Details` (not `Detail`).
* Route tables are named `<Feature>Routes.tsx`.
* Avoid generic file names such as `Form.tsx`, `List.tsx`, `Table.tsx` or `Link.tsx`. Prefix them with the feature
  they belong to (`UserForm.tsx`, `UserLink.tsx`).

---

## 🚫 Anti-Goals

* No “impressive” UI at the cost of performance
* No large UI frameworks by default
* No unnecessary abstractions
* No dependency-heavy solutions for simple problems

---

## ✅ Pull Request Guidelines

When submitting a PR:

* Keep changes **small and focused**
* Explain **why** the change is needed
* Highlight any **performance impact**
* Avoid unrelated refactors

---

## ❓ Guiding Question

Before adding anything, ask:

> Does this improve performance, responsiveness, or developer productivity?

If not, it should not be added.

---

Thank you for helping keep Reconmap fast, simple, and productive.

