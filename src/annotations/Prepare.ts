/* eslint-disable @typescript-eslint/ban-types */
import { EntityMetadata } from '../metadata/EntityMetadata'
import { FieldMetadata } from '../metadata/FieldMetadata'
import { MetadataContext } from '../metadata/MetadataContext'
import { isEntity } from '../models/isEntity'

export class Prepare {
  private field: metadata.Field
  private entity: metadata.Entity

  constructor(private context: MetadataContext, target: Object, property: string | symbol) {
    if (!isEntity(target)) {
      throw new Error('Mapping注解不能用于非 Entity 派生类型')
    }

    const entityName = target.constructor.name
    const fieldName = property

    const entity = this.context.getEntity(entityName)
    if (!entity) {
      this.entity = new EntityMetadata(entityName, target)
      this.context.setEntity(entityName, this.entity)
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