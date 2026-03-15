class MemoryStore {
    private store: Map<string, unknown>;

    constructor() {
        this.store = new Map();
    }

    set<T>(key: string, value: T): void {
        this.store.set(key, value);
    }

    get<T>(key: string): T | undefined {
        return this.store.get(key) as T | undefined;
    }

    has(key: string): boolean {
        return this.store.has(key);
    }

    delete(key: string): boolean {
        return this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}

export const memoryStore = new MemoryStore();
