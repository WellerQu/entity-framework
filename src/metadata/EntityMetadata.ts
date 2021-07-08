export class EntityMetadata implements metadata.Entity {
  name: string

  constructor(name: string) {
    this.name = name
  }
  private fieldsMap: Record<metadata.Field['name'], metadata.Field | undefined> = {}

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