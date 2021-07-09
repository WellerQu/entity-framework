/* eslint-disable @typescript-eslint/ban-types */
export class EntityMetadata implements metadata.Entity {
  readonly name: string

  private fieldsMap: Record<metadata.Field['name'], metadata.Field | undefined> = {}

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
    return this.fieldsMap[name]
  }

  getFields(): metadata.Field[] {
    const fields: metadata.Field[] = []
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