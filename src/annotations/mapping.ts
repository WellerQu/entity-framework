import jp from 'jsonpath'

import { MetadataContext } from '../metadata/MetadataContext'
import { Prepare } from '../metadata/Prepare'

type MappingDecorator = (path?: JSONPath) => (target: model.Entity, property: string) => void

export const mapping: MappingDecorator = path => (target, property) => {
  const jsonPath = path ?? `$.${property}`
  const deserializeCommand = new MappingDeserializeCommand(jsonPath, property)
  const serializeCommand = new MappingSerializeCommand(jsonPath, property)

  const prepare = new Prepare(MetadataContext.instance, target, property)
  const field = prepare.getField()

  field.serializeCommands.push(serializeCommand)
  field.deserializeCommands.push(deserializeCommand)
}

class MappingSerializeCommand implements metadata.Command {
  private path: JSONPath
  public priority = 0

  constructor(path: JSONPath, private fieldName: string) {
    this.path = path
  }

  exec(data: model.Data, entity: model.Entity): void {
    jp.value(data, this.path, Reflect.get(entity, this.fieldName))
  }
}

class MappingDeserializeCommand implements metadata.Command {
  private path: JSONPath
  public priority = 0

  constructor(path: JSONPath, private fieldName: string) {
    this.path = path
  }

  exec(data: model.Data, entity: model.Entity): void {
    Reflect.set(entity, this.fieldName, jp.value(data, this.path))
  }
}