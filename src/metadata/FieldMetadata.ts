export class FieldMetadata implements metadata.Field {
  readonly name: string;
  serializeCommands: metadata.Command[];
  deserializeCommands: metadata.Command[];

  constructor(name: string) {
    this.name = name
    this.serializeCommands = []
    this.deserializeCommands = []
  }
}