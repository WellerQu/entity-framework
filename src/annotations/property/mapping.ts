import jp from 'jsonpath'
import { AnnotationCommand } from '../../metadata/BaseCommand'

import { MetadataContext } from '../../metadata/MetadataContext'
import { Prepare } from '../Prepare'

type MappingOptions = {
  path: string
  /**
   * 类型的名称, 例如: Metric 表示指标, 或者 Metric[] 表示指标数组, 如果缺省则认为是一个 Object 或 Object[]
   */
  relatedEntityDescriptor?: string
}

type MappingDecorator = (options?: Partial<MappingOptions>) => (target: model.Entity, property: string) => void

export const mapping: MappingDecorator = options => (target, property) => {
  const mergedOptions: MappingOptions = { ...options, path: options?.path ?? `$.${property}`, }
  const prepare = new Prepare(MetadataContext.instance, target, property)
  const field = prepare.getField()

  const serializeCommand = new MappingSerializeCommand(mergedOptions, field)
  const deserializeCommand = new MappingDeserializeCommand(mergedOptions, field)

  field.appendSerializeCommand(serializeCommand)
  field.appendDeserializeCommand(deserializeCommand)
}

class MappingSerializeCommand extends AnnotationCommand {
  constructor(private options: MappingOptions, private field: metadata.Field) {
    super(0)
  }

  exec(data: model.Data, entity: model.Entity): void {
    const descriptor = this.options.relatedEntityDescriptor

    if (descriptor?.endsWith('[]')) {
      const relatedEntityName = descriptor.replace('[]', '')
      const relatedEntity = MetadataContext.instance.getEntity(relatedEntityName)

      if (!relatedEntity) {
        throw new Error(`${this.field.name} 的描述 ${descriptor} 的关联实体类型不存在`)
      }

      const instances = Reflect.get(entity, this.field.name) as model.Entity[]
      
      if (!Array.isArray(instances)) {
        throw new Error(`${this.field.name} 的实例数据不是数组`)
      }

      const origin = instances.map(item => item.serialize())
      jp.value(data, this.options.path, origin)
    } else if (descriptor) {
      const relatedEntity = MetadataContext.instance.getEntity(descriptor)

      if (!relatedEntity) {
        throw new Error(`${this.field.name} 的描述 ${descriptor} 的关联实体类型不存在`)
      }

      const instance = Reflect.get(entity, this.field.name) as model.Entity
      jp.value(data, this.options.path, instance.serialize())
    } else {
      jp.value(data, this.options.path, Reflect.get(entity, this.field.name))
    }
  }
}

class MappingDeserializeCommand extends AnnotationCommand {
  constructor(private options: MappingOptions, private field: metadata.Field) {
    super(0)
  }

  exec(data: model.Data, entity: model.Entity): void {
    const descriptor = this.options.relatedEntityDescriptor

    if (descriptor?.endsWith('[]')) {
      const relatedEntityName = descriptor.replace('[]', '')
      const relatedEntity = MetadataContext.instance.getEntity(relatedEntityName)

      if (!relatedEntity) {
        throw new Error(`${this.field.name} 的描述 ${descriptor} 的关联实体类型不存在`)
      }

      const origin = jp.value(data, this.options.path)
      if (!Array.isArray(origin)) {
        throw new Error(`${this.field.name} 的映射数据不是数组`)
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

      const instance = relatedEntity.createInstance()
      instance.deserialize(jp.value(data, this.options.path))

      Reflect.set(entity, this.field.name, instance)
    } else {
      Reflect.set(entity, this.field.name, jp.value(data, this.options.path))
    }
  }
}