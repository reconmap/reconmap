export type ToastKind = "success" | "error";

interface ToastItem {
    id: number;
    kind: ToastKind;
    message: string;
}

const DISMISS_AFTER_MS: Record<ToastKind, number> = {
    success: 4000,
    error: 8000,
};

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((listener) => listener());
}

function toMessage(value: unknown): string {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.message;
    return String(value ?? "");
}

function show(kind: ToastKind, value: unknown) {
    const id = nextId++;
    items = [...items, { id, kind, message: toMessage(value) }];
    emit();
    setTimeout(() => dismiss(id), DISMISS_AFTER_MS[kind]);
}

function dismiss(id: number) {
    const remaining = items.filter((item) => item.id !== id);
    if (remaining.length === items.length) return;
    items = remaining;
    emit();
}

export const toast = {
    success: (message: unknown) => show("success", message),
    error: (message: unknown) => show("error", message),
    dismiss,
};

export function subscribeToasts(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getToasts() {
    return items;
}
