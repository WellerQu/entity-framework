# Entity Framework

> Enables experimental support for decorators, which is in stage 2 of the TC39 standardization process.

[see more about experimentalDecorators](https://www.typescriptlang.org/tsconfig#experimentalDecorators)

## Concepts

- 映射数据 Data

  原生 Object 对象数据, 可通过反序列化操作填充到模型实例中.

- 模型 Entity

  继承自 `BaseEntity` 的类型声明, 拥有 serialize 与 deserialize 实例方法.

- 注解 Annotation

  用于描述模型与映射数据的关联关系.

- 元数据 Metadata

  用于描述模型的数据.

- 命令 Command

  命令分为序列化命令与反序列化命令, 在执行序列化操作时, 所有的序列化命令按优先级(priority)升序执行; 执行反序列化操作时, 所有的反序列化命令按优先级(priority)升序执行.

- [JSON Path](https://github.com/dchester/jsonpath#jsonpath-syntax)

## Basic example

一个类声明在继承 `BaseEntity` 后可视为一个模型声明, 该类声明的实例可以进行**序列化**与**反序列化**操作.

```typescript
class ResponseData<T> extends BaseEntity {
  @mapping()
  public data?: T

  @mapping()
  public msg?: string

  @mapping()
  public code?: number

  public others?: unknown
}
```

### Serialize

```typescript
const res = new ResponseData<boolean>()
res.code = 0
res.data = true
res.msg = 'success'
res.others = 'anything'

const data: model.Data = res.serialize()

expect(data.others).toBeUndefined()
expect(data).toEqual({ data: true, msg: 'success', code: 0 })
```

### Deserialize

```typescript
const res = new ResponseData<boolean>()
const data: model.Data = { data: true, msg: 'success', code: 0 }

res.deserialize(data)

expect(res.code).toEqual(data.code)
expect(res.msg).toEqual(data.msg)
expect(res.data).toEqual(data.data)
expect(res.others).toBeUndefined()
```

更多示例请参考 测试用例

- `test/serialize.spec.ts`
- `test/deserialize.spec.ts`

## Core annotation

- @mapping(options?: MappingOptions)

用来描述模型字段与映射数据关系的注解

```typescript
type MappingOptions = {
  /**
   * 映射路径(JSONPath)
   */
  path: string
  /**
   * 关联模型的名称 
   * 例如: Metric 表示指标, 或者 Metric[] 表示指标数组, 如果缺省则认为是一个 Object 或 Object[]
   */
  relatedEntityDescriptor?: string
}
```

## Extension annotation

TODO:

- [ ] notBeNull()
- [ ] notBeUndefined()
- [ ] notBeEmpty()
- [ ] constants()
