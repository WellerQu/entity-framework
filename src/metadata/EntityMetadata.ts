import { MetadataContext } from './MetadataContext'

/* eslint-disable @typescript-eslint/ban-types */
export class EntityMetadata implements metadata.Entity {
  readonly name: string

  private fieldsMap: Record<metadata.Field['name'], metadata.Field | undefined> = {}

  private getBaseFields(): metadata.Field[] {
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

  constructor(name: string, private prototype: object) {
    this.name = name
  }

  createInstance<T extends model.Entity>(): T
  createInstance<T extends model.Entity>(data?: model.Data): T {
    const instance = Object.create(this.prototype) as T

    if (data) {
      instance.deserialize(data)
    }

    return instance
  }

  getField(name: string): metadata.Field | undefined {
    return this.fieldsMap[name] ?? this.getBaseFields().find(item => item.name === name)
  }

  getFields(): metadata.Field[] {
    const fields: metadata.Field[] = this.getBaseFields()
    const records = Object.values(this.fieldsMap)

    for (let i = 0; i < records.length; i++) {
      const field = records[i]
      if (!field) {
        continue
      }

      fields.push(field)
    }

    return fields
  }

  setField(field: metadata.Field): void {
    this.fieldsMap[field.name] = field
  }
}