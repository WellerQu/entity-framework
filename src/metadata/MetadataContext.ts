import { Metadata } from './Metadata'

const ENTITIES_KEY = Symbol.for('entities key')

export class MetadataContext extends Metadata {
  static instance = new MetadataContext()

  private constructor() {
    super()
    this.setMetadata(ENTITIES_KEY, new Map<string | symbol, metadata.Entity>())
  }

  getEntity(key: string): metadata.Entity | undefined {
    return this.getMetadata<Map<string | symbol, metadata.Entity>>(ENTITIES_KEY)?.get(key)
  }

  setEntity(key: string, entity: metadata.Entity): void {
    this.getMetadata<Map<string | symbol, metadata.Entity>>(ENTITIES_KEY)?.set(key, entity)
  }

  clear(): void {
    this.getMetadata<Map<string | symbol, metadata.Entity>>(ENTITIES_KEY)?.clear()
  }
}