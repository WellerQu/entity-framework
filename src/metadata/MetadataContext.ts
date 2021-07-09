export class MetadataContext {
  static instance = new MetadataContext()

  private entitiesMap: Map<string, metadata.Entity>

  private constructor() {
    this.entitiesMap = new Map<string, metadata.Entity>()
  }

  getEntity(key: string): metadata.Entity | undefined {
    return this.entitiesMap.get(key)
  }

  setEntity(key: string, entity: metadata.Entity): void {
    this.entitiesMap.set(key, entity)
  }

  aliasEntity(origin: string, alias: string): void {
    const entity = this.entitiesMap.get(origin)

    if (!entity) {
      return
    }

    this.entitiesMap.set(alias, entity)
  }

  clear(): void {
    this.entitiesMap.clear()
  }
}