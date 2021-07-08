namespace metadata {
  export interface Entity{
    name: string
    getField(name: Field['name']): Field | undefined
    getFields(): Field[]
    setField(field: Field): void
  }

  export interface Field {
    readonly name: string
    serializeCommands: Command[]
    deserializeCommands: Command[]
  }

  export interface Executor {
    exec(data: model.Data, entity: model.Entity): void
  }

  export interface Command {
    readonly priority: number
    exec(data: model.Data, entity: model.Entity): void
  }
}

export as namespace metadata
