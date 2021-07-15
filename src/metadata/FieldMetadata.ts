export class FieldMetadata implements metadata.Field {
  private serializeCommands: command.Command[];
  private deserializeCommands: command.Command[];

  constructor(public readonly name: metadata.Field['name']) {
    this.serializeCommands = []
    this.deserializeCommands = []
  }

  getSerializeCommands(): command.Command[] {
    return this.serializeCommands
  }

  getDeserializeCommands(): command.Command[] {
    return this.deserializeCommands
  }

  appendSerializeCommand(command: command.Command): void {
    this.serializeCommands.push(command)
  }

  appendDeserializeCommand(command: command.Command): void {
    this.deserializeCommands.push(command)
  }
}