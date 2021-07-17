/* eslint-disable @typescript-eslint/ban-types */
import { EntityMetadata } from '../../metadata/EntityMetadata'
import { MetadataContext } from '../../metadata/MetadataContext'

export class Prepare {
  private entity: metadata.Entity

  constructor(private context: MetadataContext, target: Function) {
    const entityName = target.name

    const entity = this.context.getEntity(entityName)
    if (!entity) {
      this.entity = new EntityMetadata(entityName, target)
      this.context.setEntity(entityName, this.entity)
    } else {
      this.entity = entity
    }
  }

  getEntity(): metadata.Entity {
    return this.entity
  }
}