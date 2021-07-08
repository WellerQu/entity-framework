import { EntityMetadata } from './EntityMetadata'

export class MetadataContext {
  private entitiesMap: Record<string, metadata.Entity | undefined> = {}

  getEntity(key: string): metadata.Entity | undefined {
    return this.entitiesMap[key]
  }

  setEntity(key: string, entity: metadata.Entity): void {
    this.entitiesMap[key] = entity
  }

  createEntity(entityName: string): metadata.Entity {
    return new EntityMetadata(entityName)
  }
}

export const context = new MetadataContext()