import { FieldMetadata } from './FieldMetadata'
import { MetadataContext } from './MetadataContext'

export class Prepare {
  private field: metadata.Field
  private entity: metadata.Entity

  constructor(context: MetadataContext, target: model.Entity, property: string) {
    const entityName = target.constructor.name
    const fieldName = property

    const entity = context.getEntity(entityName)
    if (!entity) {
      this.entity = context.createEntity(entityName)
      context.setEntity(entityName, this.entity)
    } else {
      this.entity = entity
    }

    const field = this.entity.getField(fieldName)
    if (!field) {
      this.field = new FieldMetadata(fieldName)
      this.entity.setField(this.field)
    } else {
      this.field = field
    }
  }

  getEntity(): metadata.Entity {
    return this.entity
  }

  getField(): metadata.Field {
    return this.field
  }
}