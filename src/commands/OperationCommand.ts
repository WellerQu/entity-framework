export abstract class OperationCommand implements command.Command {
  private $priority: number
  public get priority(): number {
    return this.$priority
  }

  constructor(priority: number) {
    this.$priority = priority
  }

  abstract exec(data: model.Data, entity: model.DataModel): void
}