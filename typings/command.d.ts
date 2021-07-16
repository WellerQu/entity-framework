namespace command {
  export interface Executor {
    exec(data: model.Data, entity: model.DataModel): void
  }

  export interface Command {
    readonly priority: number
    exec(data: model.Data, entity: model.DataModel): void
  }
}

export as namespace command