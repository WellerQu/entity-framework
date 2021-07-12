namespace metadata {
  export interface Entity{
    readonly name: string

    getField(name: Field['name']): Field | undefined
    getFields(): Field[]
    setField(field: Field): void

    createInstance<T extends model.Entity>(data?: model.Data): T
  }

  export interface Field {
    readonly name: string

    getSerializeCommands(): Command[]
    getDeserializeCommands(): Command[]

    appendSerializeCommand(command: Command): void
    appendDeserializeCommand(command: Command): void
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