export abstract class Metadata implements metadata.Metadata {
  protected metadataMap: Map<string | symbol, unknown>

  protected constructor() {
    this.metadataMap = new Map<string | symbol, unknown>()
  }

  setMetadata<T extends unknown>(key: string | symbol, data: T): void {
    this.metadataMap.set(key, data)
  }

  getMetadata<T extends unknown>(key: string | symbol): T | undefined {
    return this.metadataMap.get(key) as T | undefined
  }

  abstract clear(): void
}