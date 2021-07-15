namespace metadata {
  export interface Entity{
    readonly name: string

    getField(name: Field['name']): Field | undefined
    getFields(): Field[]
    setField(field: Field): void

    createInstance<T extends model.Entity>(data?: model.Data): T
  }

  export interface Field {
    readonly name: string | symbol

    getSerializeCommands(): command.Command[]
    getDeserializeCommands(): command.Command[]

    appendSerializeCommand(command: command.Command): void
    appendDeserializeCommand(command: command.Command): void
  }
}

export as namespace metadata