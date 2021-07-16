export class BatchExecutor implements command.Executor {
  private commands: command.Command[]

  constructor(commands: command.Command[]) {
    this.commands = commands
    this.commands.sort((a, b) => a.priority - b.priority)
  }

  exec(data: model.Data, entity: model.DataModel): void {
    this.commands.forEach(cmd => cmd.exec(data, entity))
  }
}