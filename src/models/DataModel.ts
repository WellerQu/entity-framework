import { COMMAND_DESERIALIZE_KEY, COMMAND_SERIALIZE_KEY } from '../metadata/constants'
import { BatchExecutor } from '../commands/BatchExecutor'
import { MetadataContext } from '../metadata/MetadataContext'

export abstract class DataModel implements model.DataModel {
  protected doSerialize?: () => model.Data
  protected doDeSerialize?: (data: model.Data) => void

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected static isInheritDataModel(target: Object | null): boolean {
    let prototype = target

    while(prototype !== null) {
      if (prototype === DataModel) {
        return true
      }

      prototype = Object.getPrototypeOf(prototype)
    }

    return false
  }

  serialize(initial: model.Data = {}): model.Data {
    if (this.doSerialize) {
      return this.doSerialize()
    }

    const entity = MetadataContext.instance.getEntity(this.constructor.name)
    if (!entity) {
      return
    }

    const data: model.Data = initial
    const fields = entity.getFields()
    for (let i = 0; i < fields.length; i++) {
      const commands = fields[i].getMetadata<command.Command[]>(COMMAND_SERIALIZE_KEY)

      if (!commands) 
        continue

      const executor = new BatchExecutor(commands)
      executor.exec(data, this)
    }

    return data
  }

  deserialize(data: model.Data): void {
    if (this.doDeSerialize) {
      return this.doDeSerialize(data)
    }

    const entity = MetadataContext.instance.getEntity(this.constructor.name)
    if (!entity) {
      return
    }

    const fields = entity.getFields()
    for (let i = 0; i < fields.length; i++) {
      const commands = fields[i].getMetadata<command.Command[]>(COMMAND_DESERIALIZE_KEY)

      if (!commands)
        continue

      const executor = new BatchExecutor(commands)
      executor.exec(data, this)
    }
  }

  fillModel<T extends DataModel>(source: Partial<T>): this {
    Reflect.ownKeys(source)
    .forEach(key => {
      const value = Reflect.get(source, key)
      Reflect.set(this, key, value)
    })

    return this
  }
}