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

