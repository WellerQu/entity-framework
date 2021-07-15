import { BatchExecutor } from '../commands/BatchExecutor'
import { MetadataContext } from '../metadata/MetadataContext'

export abstract class Entity implements model.Entity {
  protected doSerialize?: () => model.Data
  protected doDeSerialize?: (data: model.Data) => void

  serialize(): model.Data {
    if (this.doSerialize) {
      return this.doSerialize()
    }

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
      const commands = fields[i].getDeserializeCommands()
      const executor = new BatchExecutor(commands)

      executor.exec(data, this)
    }
  }
}