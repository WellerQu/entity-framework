import { MetadataContext } from '../../metadata/MetadataContext'
import { Command } from '../../commands/Command'
import { Prepare } from './Prepare'
import { COMMAND_DESERIALIZE_KEY, COMMAND_SERIALIZE_KEY } from '../constants'

type AssertDecorator = (msg?: string) => PropertyDecorator
type AssertValidator = (value: unknown, message: string) => void

const notBeNullValidator: AssertValidator = (value, message) => {
  if (value === null) {
    throw new Error(message)
  }
}

const notBeUndefinedValidator: AssertValidator = (value, message) => {
  if (value === undefined) {
    throw new Error(message)
  }
}

const notBeEmptyValidator: AssertValidator = (value, message) => {
  if (value === undefined || value === null) {
    throw new Error(message)
  }
}

const assertFactory = (validator: AssertValidator, massager: (fieldName: string) => string): AssertDecorator => {
  return (msg) => (target, property) => {
    const prepare = new Prepare(MetadataContext.instance, target, property)
    const field = prepare.getField()
    const defaultMessage = massager(field.name.toString())

    const serializeCommand = new AssertCommand(field.name, `在 Serialize 时: ${msg ?? defaultMessage}`, validator)
    const deserializeCommand = new AssertCommand(field.name, `在 Deserialize 时: ${msg ?? defaultMessage}`, validator)

    field.append(COMMAND_SERIALIZE_KEY, serializeCommand)
    field.append(COMMAND_DESERIALIZE_KEY, deserializeCommand)
  }
}

class AssertCommand extends Command {
  constructor(
    private fieldName: metadata.Field['name'],
    private message: string,
    private validator: AssertValidator,
  ) {
    super(24)
  }

  exec(_: model.Data, entity: model.DataModel): void {
    const value = Reflect.get(entity, this.fieldName)
    this.validator(value, this.message)
  }
}

export const NotBeNull: AssertDecorator = assertFactory(notBeNullValidator, name => `${name} 不能为 null`)
export const NotBeUndefined: AssertDecorator = assertFactory(notBeUndefinedValidator, name => `${name} 不能为 undefined`)
export const NotBeEmpty: AssertDecorator = assertFactory(notBeEmptyValidator, name => `${name} 不能为 null 或 undefined`)