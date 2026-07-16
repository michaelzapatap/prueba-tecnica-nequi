export abstract class KeyValueStorage {
  abstract getItem(key: string): string | null;
  abstract setItem(key: string, value: string): void;
  abstract removeItem(key: string): void;
}

export class BrowserKeyValueStorage implements KeyValueStorage {
  getItem(key: string): string | null {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  setItem(key: string, value: string): void {
    globalThis.localStorage?.setItem(key, value);
  }

  removeItem(key: string): void {
    globalThis.localStorage?.removeItem(key);
  }
}
