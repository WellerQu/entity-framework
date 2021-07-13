import { BatchExecutor } from '../metadata/BatchExecutor'
import { MetadataContext } from '../metadata/MetadataContext'

export abstract class Entity implements model.Entity {
  serialize(): model.Data {
    const entity = MetadataContext.instance.getEntity(this.constructor.name)
    if (!entity) {
      return {}
    }

    const data: model.Data = {}
    const fields = entity.getFields()
    for (let i = 0; i < fields.length; i++) {
      const commands = fields[i].getSerializeCommands()
      const executor = new BatchExecutor(commands)

      executor.exec(data, this)
    }

    return data
  }

  deserialize(data: model.Data): model.Entity {
    const entity = MetadataContext.instance.getEntity(this.constructor.name)
    if (!entity) {
      return this
    }

    const fields = entity.getFields()
    for (let i = 0; i < fields.length; i++) {
      const commands = fields[i].getDeserializeCommands()
      const executor = new BatchExecutor(commands)

      executor.exec(data, this)
    }

    return this
  }
}