import { Metadata } from './Metadata'
import { MetadataContext } from './MetadataContext'

const FIELDS_KEY = Symbol.for('fields key')
const RESOURCES_KEY = Symbol.for('resources key')

export class EntityMetadata extends Metadata implements metadata.Entity {
  readonly name: string

  private getInheritFields(): metadata.Field[] {
    const fields: metadata.Field[] = []

    let proto = Object.getPrototypeOf(this.prototype)
    while(proto !== null) {
      const entityName = proto.constructor.name
      const entity = MetadataContext.instance.getEntity(entityName)

      if (entity) {
        fields.push(...entity.getFields())
      }

      proto = Object.getPrototypeOf(proto)
    }

    return fields
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(name: string, private prototype: object) {
    super()

    this.name = name
    this.setMetadata(FIELDS_KEY, new Map<metadata.Field['name'], metadata.Field>())
    this.setMetadata(RESOURCES_KEY, new Map<metadata.Resource['id'], metadata.Resource>())
  }

  clear(): void {
    this.getMetadata<Map<metadata.Field['name'], metadata.Field>>(FIELDS_KEY)?.clear()
  }

  createInstance<T extends model.DataModel>(): T
  createInstance<T extends model.DataModel>(data?: model.Data): T {
    const instance = Object.create(this.prototype) as T

    if (data) {
      instance.deserialize(data)
    }

    return instance
  }

  getField(name: metadata.Field['name']): metadata.Field | undefined {
    return this.getMetadata<Map<metadata.Field['name'], metadata.Field>>(FIELDS_KEY)?.get(name) 
      ?? this.getInheritFields().find(item => item.name === name)
  }

  getFields(): metadata.Field[] {
    const fields: metadata.Field[] = this.getInheritFields()

    const records = this.getMetadata<Map<metadata.Field['name'], metadata.Field>>(FIELDS_KEY)?.values()
    if (!records) {
      return fields
    }

    for (const field of records) {
      if (!field) {
        continue
      }

      fields.push(field)
    }

    return fields
  }

  setField(field: metadata.Field): void {
    this.getMetadata<Map<metadata.Field['name'], metadata.Field>>(FIELDS_KEY)?.set(field.name, field)
  }

  setResource(id: string | symbol, resource: metadata.Resource): void {
    this.getMetadata<Map<metadata.Resource['id'], metadata.Resource>>(RESOURCES_KEY)?.set(id, resource)
  }

  getResource(id: string | symbol): metadata.Resource | undefined {
    return this.getMetadata<Map<metadata.Resource['id'], metadata.Resource>>(RESOURCES_KEY)?.get(id)
  }
}