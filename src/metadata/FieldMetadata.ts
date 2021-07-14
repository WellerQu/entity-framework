export class FieldMetadata implements metadata.Field {
  private serializeCommands: metadata.Command[];
  private deserializeCommands: metadata.Command[];

  constructor(public readonly name: metadata.Field['name']) {
    this.serializeCommands = []
    this.deserializeCommands = []
  }

  getSerializeCommands(): metadata.Command[] {
    return this.serializeCommands
  }

  getDeserializeCommands(): metadata.Command[] {
    return this.deserializeCommands
  }

  appendSerializeCommand(command: metadata.Command): void {
    this.serializeCommands.push(command)
  }

  appendDeserializeCommand(command: metadata.Command): void {
    this.deserializeCommands.push(command)
  }
}