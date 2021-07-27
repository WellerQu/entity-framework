# Entity Framework

[![CI](https://github.com/WellerQu/entity-framework/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/WellerQu/entity-framework/actions/workflows/main.yml)

> Enables experimental support for decorators, which is in stage 2 of the TC39 standardization process.

[see more about experimentalDecorators](https://www.typescriptlang.org/tsconfig#experimentalDecorators)

## 基本用法

一个类声明在继承 `DataModel` 后可视为一个模型声明, 该类声明的实例可以进行**序列化**与**反序列化**操作.

```typescript
class ResponseData<T> extends DataModel {
  @Mapping()
  public data?: T

  @Mapping()
  public msg?: string

  @Mapping()
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

## 概念介绍

- 映射数据 Data

  原生 Object 对象数据, 可通过反序列化操作填充到模型实例中.

- 模型 DataModel

  继承自 `DataModel` 的类型声明, 拥有 `serialize` 与 `deserialize` 实例方法.

- 注解 Annotation

  用于描述模型与映射数据的关联关系.

- 元数据 Metadata

  用于描述模型的数据.

- 操作命令 OperationCommand

  命令分为序列化命令与反序列化命令, 在执行序列化操作时, 所有的序列化命令按优先级(priority)升序执行; 执行反序列化操作时, 所有的反序列化命令按优先级(priority)升序执行.

- 资源 Resource

  映射服务端提供的 API 接口

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
  | @Mapping({ path: 'id' }) | 1 | 如果类型成员字段与path一致, 可缺省 |
  | @Mapping({ path: 'filters[0]' }) | { "name": "5天精通数据格式转换" } | 通过索引范文映射数据数组的特定位置 |
  | @Mapping({ path: 'filters[1:]' }) | ["JavaScript...", "编译...", ...]  | filters数组的后6项数据 |
  | @Mapping({ path: 'stores' }) | [{"id": 2, "name": "..."}, ...]  | stores数组的全部数据 |

## 更多用法

- 递归数据类型映射

  ```typescript
  class Pattern extends DataModel {
    @Mapping()
    id?: number

    @Mapping()
    name?: string

    @Mapping({ relatedEntityDescriptor: 'Pattern' })
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

- 将模型字段映射到多维数组

  ```typescript
  class LogSource extends DataModel {
    @Mapping()
    name?: string
  }

  class Category extends DataModel {
    @Mapping()
    name?: string
  }

  class Rule extends DataModel {
    @Mapping({ relatedEntityDescriptor: 'LogSource', path: 'filters[0][1]' })
    logSource?: LogSource

    @Mapping({ relatedEntityDescriptor: 'Category', path: 'filters[1][2]' })
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

- 将模型字段映射到对象中的数组切片

  ```typescript
  class Foo extends DataModel {
    @Mapping({ path: 'filters[0]' })
    id?: number

    @Mapping({ path: 'filters[1]' })
    name?: string

    @Mapping({ path: 'filters[2:3]' })
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

- 将模型字段直接映射到数组切片

  ```typescript
  class CategorySet extends DataModel {
    @Mapping({ path: '[0]' })
    id?: number

    @Mapping({ path: '[1:]' })
    categories?: string[]
  }

  const set = new CategorySet()
  set.id = 1
  set.categories = ['c1', 'c2', 'c3']

  const data: model.Data = set.serialize([]) // !!important!! 注意, 这里需要提供初始化数据

  expect(data[0]).toBe(1)
  expect(data[1]).toBe('c1')
  expect(data[2]).toBe('c2')
  expect(data[3]).toBe('c3')
  expect(data).toBeInstanceOf(Array)
  ```

## 注解

### 数据映射关系注解

  用于自动序列化过程与反序列化过程中关联模型字段与映射数据的键

- `@Mapping(options?: MappingOptions)`

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

### 断言注解

  在序列化过程与反序列化过程后对模型中的数据进行断言

- `@NotBeNull(msg?: string)`

  在 `Serialize` 或 `Deserialize` 时断言实例字段不会为 `null`, 断言失败时将 `msg` 信息以 `throw new Error(msg)` 的形式抛出.

- `@NotBeUndefined(msg?: string)`

  在 `Serialize` 或 `Deserialize` 时断言实例字段不会为 `undefined`, 断言失败时将 `msg` 信息以 `throw new Error(msg)` 的形式抛出.

- `@NotBeEmpty(msg?: string)`

  在 `Serialize` 或 `Deserialize` 时断言实例字段不会为 `null` 或 `undefined`, 断言失败时将 `msg` 信息以 `throw new Error(msg)` 的形式抛出. 等价于同时使用 `@NotBeNull() @NotBeUndefined()`

## 自定义序列化与反序列化

  使用 `@Mapping()` 注解的自动序列化与反序列化无法覆盖某些特殊场景, 此时需要在`DataModel`派生类构造函数中编写自定义序列化函数(`doSerialize`)与反序列化函数(`doDeSerialize`). **一旦使用了自定义函数**, 则忽略所有注解.

- 自定义序列化

  ```typescript
  class Company extends DataModel {
    constructor() {
      super()

      this.doSerialize = () => {
        return { id: (this.id ?? 0) + 244 }
      }
    }

    id?: number | null
  }

  const company = new Company()
  company.id = 11

  const data: model.Data = company.serialize()

  expect(data.id).toBe(255)
  ```

- 自定义反序列化

  ```typescript
  class Company extends DataModel {
    constructor() {
      super()

      this.doDeSerialize = (data: model.Data) => {
        this.id = data.aid
      }
    }

    id?: number | null
  }

  const data: model.Data = { aid: 255 }

  const company = new Company()
  company.deserialize(data)

  expect(company.id).toBe(255)
  ```
