import { MetadataContext } from '../../metadata/MetadataContext'
import { OperationCommand } from '../../metadata/OperationCommand'
import { Prepare } from '../Prepare'

type AssertDecorator = (msg?: string) => PropertyDecorator

export const NotBeNull: AssertDecorator = (msg) => (target, property) => {
  const prepare = new Prepare(MetadataContext.instance, target, property)
  const field = prepare.getField()

  const serializeCommand = new AssertCommand((_, entity) => {
    if (Reflect.get(entity, field.name) === null) {
      throw new Error(msg ?? `${field.name.toString()} 在 Serialize 时不能为 null`)
    }
  })

  field.appendSerializeCommand(serializeCommand)
}

export const NotBeUndefined: AssertDecorator = (msg) => (target, property) => {
  const prepare = new Prepare(MetadataContext.instance, target, property)
  const field = prepare.getField()

  const serializeCommand = new AssertCommand((_, entity) => {
    if (Reflect.get(entity, field.name) === undefined) {
      throw new Error(msg ?? `${field.name.toString()} 在 Serialize 时不能为 undefined`)
    }
  })

  field.appendSerializeCommand(serializeCommand)
}

export const NotBeEmpty: AssertDecorator = (msg) => (target, property) => {
  const prepare = new Prepare(MetadataContext.instance, target, property)
  const field = prepare.getField()

  const serializeCommand = new AssertCommand((_, entity) => {
    const value = Reflect.get(entity, field.name)
    if (value === undefined || value === null) {
      throw new Error(msg ?? `${field.name.toString()} 在 Serialize 时不能为 null 或 undefined`)
    }
  })

  field.appendSerializeCommand(serializeCommand)
}

class AssertCommand extends OperationCommand {
  constructor(private validator: (data: model.Data, entity: model.Entity) => void) {
    super(24)
  }

  exec(data: model.Data, entity: model.Entity): void {
    this.validator(data, entity)
  }
}