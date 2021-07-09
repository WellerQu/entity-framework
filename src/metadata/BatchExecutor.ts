export class BatchExecutor implements metadata.Executor {
  private commands: metadata.Command[]

  constructor(commands: metadata.Command[]) {
    this.commands = commands
    this.commands.sort((a, b) => a.priority - b.priority)
  }

  exec(data: model.Data, entity: model.Entity): void {
    this.commands.forEach(cmd => cmd.exec(data, entity))
  }
}