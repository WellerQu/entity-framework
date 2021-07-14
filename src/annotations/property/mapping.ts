import { OperationCommand } from '../../metadata/OperationCommand'
import { Accessor } from '../../accessor/Accessor'

import { MetadataContext } from '../../metadata/MetadataContext'
import { Prepare } from '../Prepare'

type MappingOptions = {
  /**
   * 数据映射路径
   */
  path: string
  /**
   * 关联模型的名称 
   * 例如: Metric 表示指标, 或者 Metric[] 表示指标数组, 如果缺省则认为是一个 Object 或 Object[]
   */
  relatedEntityDescriptor?: string
}

type MappingDecorator = (options?: Partial<MappingOptions>) => PropertyDecorator

export const Mapping: MappingDecorator = options => (target, property) => {
  const mergedOptions: MappingOptions = { ...options, path: options?.path ?? property.toString() }
  const prepare = new Prepare(MetadataContext.instance, target, property)
  const field = prepare.getField()

  const serializeCommand = new MappingSerializeCommand(mergedOptions, field)
  const deserializeCommand = new MappingDeserializeCommand(mergedOptions, field)

  field.appendSerializeCommand(serializeCommand)
  field.appendDeserializeCommand(deserializeCommand)
}

class MappingSerializeCommand extends OperationCommand {
  constructor(private options: MappingOptions, private field: metadata.Field) {
    super(0)
  }

  exec(data: model.Data, entity: model.Entity): void {
    const descriptor = this.options.relatedEntityDescriptor
    const accessor = new Accessor(data, this.options.path)

    if (descriptor?.endsWith('[]')) {
      const relatedEntityName = descriptor.replace('[]', '')
      const relatedEntity = MetadataContext.instance.getEntity(relatedEntityName)

      if (!relatedEntity) {
        throw new Error(`${this.field.name.toString()} 的描述 ${descriptor} 的关联实体类型不存在`)
      }

      const instances = Reflect.get(entity, this.field.name) as model.Entity[] | undefined
      if (!instances) {
        return
      }
      
      if (!Array.isArray(instances)) {
        throw new Error(`${this.field.name.toString()} 的实例数据不是数组`)
      }

      const origin = instances.map(item => item.serialize())

      accessor.setValue(origin)
    } else if (descriptor) {
      const relatedEntity = MetadataContext.instance.getEntity(descriptor)

      if (!relatedEntity) {
        throw new Error(`${this.field.name.toString()} 的描述 ${descriptor} 的关联实体类型不存在`)
      }

      const instance = Reflect.get(entity, this.field.name) as model.Entity | undefined
      if (!instance) {
        return
      }

      accessor.setValue(instance.serialize())
    } else {
      accessor.setValue(Reflect.get(entity, this.field.name))
    }
  }
}

class MappingDeserializeCommand extends OperationCommand {
  constructor(private options: MappingOptions, private field: metadata.Field) {
    super(0)
  }

  exec(data: model.Data, entity: model.Entity): void {
    const descriptor = this.options.relatedEntityDescriptor
    const accessor = new Accessor(data, this.options.path)

    if (descriptor?.endsWith('[]')) {
      const relatedEntityName = descriptor.replace('[]', '')
      const relatedEntity = MetadataContext.instance.getEntity(relatedEntityName)

      if (!relatedEntity) {
        throw new Error(`${this.field.name.toString()} 的描述 ${descriptor} 的关联实体类型不存在`)
      }

      const origin = accessor.getValue<model.Data[]>()
      if (origin === undefined) {
        return
      }

      if (!Array.isArray(origin)) {
        throw new Error(`${this.field.name.toString()} 的映射数据不是数组`)
      }

      const array = origin.map(item => {
        return relatedEntity.createInstance(item)
      })

      Reflect.set(entity, this.field.name, array)
    } else if (descriptor) {
      const relatedEntity = MetadataContext.instance.getEntity(descriptor)

      if (!relatedEntity) {
        throw new Error(`描述的关联实体类型不存在: ${descriptor}`)
      }

      const value = accessor.getValue()
      if (!value) {
        return
      }

      const instance = relatedEntity.createInstance()
      instance.deserialize(accessor.getValue())

      Reflect.set(entity, this.field.name, instance)
    } else {
      Reflect.set(entity, this.field.name, accessor.getValue())
    }
  }
}