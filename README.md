# Entity Framework

> Enables experimental support for decorators, which is in stage 2 of the TC39 standardization process.

[see more about experimentalDecorators](https://www.typescriptlang.org/tsconfig#experimentalDecorators)

## Basic Example

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

## Concepts

- 映射数据 Data

  原生 Object 对象数据, 可通过反序列化操作填充到模型实例中.

- 模型 Entity

  继承自 `BaseEntity` 的类型声明, 拥有 `serialize` 与 `deserialize` 实例方法.

- 注解 Annotation

  用于描述模型与映射数据的关联关系.

- 元数据 Metadata

  用于描述模型的数据.

- 操作命令 OperationCommand

  命令分为序列化命令与反序列化命令, 在执行序列化操作时, 所有的序列化命令按优先级(priority)升序执行; 执行反序列化操作时, 所有的反序列化命令按优先级(priority)升序执行.

- 数据访问路径 DataAccessorPath

  描述数据在映射数据结构中所在位置的拥有特定语法的的字符串.

  ```json
  {
    "id": 1,
    "name": "Xin Hua book store",
    "filters": [
      {
        "name": "5天精通数据格式转换"
      },
      "JavaScript 犀牛书",
      "编译原理 鲸书",
      "OOP 设计模式",
      "反射",
      "装饰器",
      "Jest TDD 测试驱动"
    ],
    "stores": [
      {
        "id": 2,
        "name": "Xin Hua book store 2"
      },
      {
        "id": 3,
        "name": "Xin Hua book store 3"
      },
      {
        "id": 4,
        "name": "Xin Hua book store 4"
      }
    ]
  }
  ```

  | 数据访问路径 | 映射数据 | 说明 |
  | -- | -- | -- |
  | @mapping({ path: 'id' }) | id | 如果类型成员字段与path一致, 可缺省 |
  | @mapping({ path: 'filters[0]' }) | { "name": "5天精通数据格式转换" } | 通过索引范文映射数据数组的特定位置 |
  | @mapping({ path: 'filters[1:]' }) | ["JavaScript...", "编译...", ...]  | filters数组的后6项数据 |
  | @mapping({ path: 'stores' }) | [{"id": 2, "name": "..."}, ...]  | stores数组的全部数据 |

## Recursive Data Structure

```typescript
class Pattern extends BaseEntity {
  @mapping()
  id?: number

  @mapping()
  name?: string

  @mapping({ relatedEntityDescriptor: 'Pattern' })
  pattern?: Pattern
}

const pattern = new Pattern()
pattern.id = 1
pattern.name = 'P1'
pattern.pattern = new Pattern()
pattern.pattern.id = 2
pattern.pattern.name = 'P2'

const data: model.Data = pattern.serialize()

expect(data.id).toBe(1)
expect(data.name).toBe('P1')
expect(data.pattern.id).toBe(2)
expect(data.pattern.name).toBe('P2')
```

## Nested Array

```typescript
class LogSource extends BaseEntity {
  @mapping()
  name?: string
}

class Category extends BaseEntity {
  @mapping()
  name?: string
}

class Rule extends BaseEntity {
  @mapping({ relatedEntityDescriptor: 'LogSource', path: 'filters[0][1]' })
  logSource?: LogSource

  @mapping({ relatedEntityDescriptor: 'Category', path: 'filters[1][2]' })
  category?: Category
}

const rule = new Rule()

rule.logSource = new LogSource()
rule.logSource.name = 'logSource'

rule.category = new Category()
rule.category.name = 'category'

const data: model.Data = rule.serialize()

expect(data.filters?.[0][1].name).toBe('logSource')
expect(data.filters?.[1][2].name).toBe('category')
```

## Slice Array

```typescript
class Foo extends BaseEntity {
  @mapping({ path: 'filters[0]' })
  id?: number

  @mapping({ path: 'filters[1]' })
  name?: string

  @mapping({ path: 'filters[2:3]' })
  children?: string[]
}

const foo = new Foo()
foo.id = 1
foo.name = 'foo'
foo.children = ['Hello', 'World']

const data: model.Data = foo.serialize()

expect(data.filters).toHaveLength(3)
expect(data.filters[0]).toBe(1)
expect(data.filters[1]).toBe('foo')
expect(data.filters[2]).toBe('Hello')
expect(data.filters[3]).toBeUndefined()
```

## Core Annotation

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

## Extension Annotation

TODO:

- [ ] notBeNull()
- [ ] notBeUndefined()
- [ ] notBeEmpty()
- [ ] constants()
