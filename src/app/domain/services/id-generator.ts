export interface IdGenerator {
  create(): string;
}

export class CryptoIdGenerator implements IdGenerator {
  create(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
