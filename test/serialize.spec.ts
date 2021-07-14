/// <reference types="../typings/model" />

import { Entity, Mapping, NotBeEmpty, NotBeNull, NotBeUndefined } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('序列化', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  describe('@Mapping()', () => {
    it('序列化实例成同构数据', () => {
      class ResponseData<T> extends Entity {
        @Mapping()
        public data?: T

        @Mapping()
        public msg?: string

        @Mapping()
        public code?: number

        public others?: unknown
      }

      const res = new ResponseData<boolean>()
      res.code = 0
      res.data = true
      res.msg = 'success'
      res.others = 'anything'

      const data: model.Data = res.serialize()

      expect(data.others).toBeUndefined()
      expect(data).toEqual({ data: true, msg: 'success', code: 0 })
    })

    it('序列化实例成异构数据', () => {
      class ResponseData<T> extends Entity {
        @Mapping()
        public data?: T

        @Mapping({ path: 'message' })
        public msg?: string
      }

      const res = new ResponseData<boolean>()
      const data: model.Data = { data: true, message: 'success', code: 0 }

      res.deserialize(data)

      expect(res.data).toBe(data.data)
      expect(res.msg).toBe(data.message)
    })

    it('序列化实例到同构复合结构数据', () => {
      class Pattern extends Entity {
        @Mapping()
        public id?: number

        @Mapping({ relatedEntityDescriptor: 'Strategy' })
        public strategy?: Strategy
      }

      class Strategy extends Entity {
        @Mapping()
        name?: string

        @Mapping({ relatedEntityDescriptor: 'Metric' })
        metric?: Metric
      }

      class Metric extends Entity {
        @Mapping({ path: 'jar' })
        bar?: string
      }

      const pattern = new Pattern()
      pattern.id = 1
      pattern.strategy = new Strategy()
      pattern.strategy.name = 'foo'
      pattern.strategy.metric = new Metric()
      pattern.strategy.metric.bar = 'bar'

      const data: model.Data = pattern.serialize()

      expect(data.id).toBe(1)
      expect(data.strategy.name).toBe('foo')
      expect(data.strategy.metric.jar).toBe('bar')
    })

    it('序列化实例到同构复合结构数组', () => {
      class LogSource extends Entity {
        @Mapping()
        name?: string

        @Mapping({ relatedEntityDescriptor: 'Category[]' })
        categories?: Category[]
      }

      class Category extends Entity {
        @Mapping()
        name?: string
      }

      const logSource = new LogSource()
      const c1 = new Category()
      const c2 = new Category()

      logSource.name = 'foo'
      c1.name = 'c1'
      c2.name = 'c2'
      logSource.categories = [c1, c2]

      const data: model.Data = logSource.serialize()

      expect(data.name).toBe('foo')
      expect(data.categories).toHaveLength(2)
      expect(data.categories?.[0].name).toBe('c1')
      expect(data.categories?.[1].name).toBe('c2')
    })

    it('序列化实例到复合结构数组的特定位置 [n]', () => {
      class LogSource extends Entity {
        @Mapping()
        name?: string
      }

      class Category extends Entity {
        @Mapping()
        name?: string
      }

      class Rule extends Entity {
        // logSource 使用 filters 的第 0 位置
        @Mapping({ relatedEntityDescriptor: 'LogSource', path: 'filters[0]' })
        logSource?: LogSource

        // category 使用 filters 的第 1 位置
        @Mapping({ relatedEntityDescriptor: 'Category', path: 'filters[1]' })
        category?: Category
      }

      const rule = new Rule()

      rule.logSource = new LogSource()
      rule.logSource.name = 'logSource'

      rule.category = new Category()
      rule.category.name = 'category'

      const data: model.Data = rule.serialize()

      expect(data.filters?.[0].name).toBe('logSource')
      expect(data.filters?.[1].name).toBe('category')
    })

    it('序列化实例到复合结构数组的特定位置 [n][m]', () => {
      class LogSource extends Entity {
        @Mapping()
        name?: string
      }

      class Category extends Entity {
        @Mapping()
        name?: string
      }

      class Rule extends Entity {
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
    })

    it('序列化递归数据结构', () => {
      class Pattern extends Entity {
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
    })

    it('序列化实例到混合切片数据 [n:m]', () => {
      class Foo extends Entity {
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
    })

    it('序列化实例到切片数据 [:]', () => {
      class Foo extends Entity {
        @Mapping({ path: 'filters[:]' })
        filters?: number[]
      }

      const foo = new Foo()
      foo.filters = [1, 2, 3, 4, 5]

      const data: model.Data = foo.serialize()

      expect(data.filters).toHaveLength(5)
      expect(data.filters[0]).toBe(1)
      expect(data.filters[1]).toBe(2)
      expect(data.filters[2]).toBe(3)
      expect(data.filters[3]).toBe(4)
      expect(data.filters[4]).toBe(5)
    })

    it('序列化实例到切片数据 []', () => {
      class Foo extends Entity {
        @Mapping({ path: 'filters[]' })
        filters?: number[]
      }

      const foo = new Foo()
      foo.filters = [1, 2, 3, 4, 5]

      const data: model.Data = foo.serialize()

      expect(data.filters).toHaveLength(5)
      expect(data.filters[0]).toBe(1)
      expect(data.filters[1]).toBe(2)
      expect(data.filters[2]).toBe(3)
      expect(data.filters[3]).toBe(4)
      expect(data.filters[4]).toBe(5)
    })

    it('序列化实例到切片数据 [n:]', () => {
      class Foo extends Entity {
        @Mapping({ path: 'filters[2:]' })
        filters?: number[]
      }

      const foo = new Foo()
      foo.filters = [1, 2, 3, 4, 5]

      const data: model.Data = foo.serialize()

      expect(data.filters).toHaveLength(7)
      expect(data.filters[0]).toBeUndefined()
      expect(data.filters[1]).toBeUndefined()
      expect(data.filters[2]).toBe(1)
      expect(data.filters[3]).toBe(2)
      expect(data.filters[4]).toBe(3)
      expect(data.filters[5]).toBe(4)
      expect(data.filters[6]).toBe(5)
    })

    it('序列化实例到切片数据 [:m]', () => {
      class Foo extends Entity {
        @Mapping({ path: 'filters[:4]' })
        filters?: number[]
      }

      const foo = new Foo()
      foo.filters = [1, 2, 3, 4, 5]

      const data: model.Data = foo.serialize()

      expect(data.filters).toHaveLength(4)
      expect(data.filters[0]).toBe(1)
      expect(data.filters[1]).toBe(2)
      expect(data.filters[2]).toBe(3)
      expect(data.filters[3]).toBe(4)
      expect(data.filters[4]).toBeUndefined()
    })

    it('序列化间接继承 Entity 的类型实例', () => {
      class Foo extends Entity {
        @Mapping()
        id?: number

        @Mapping()
        name?: string
      }

      class Bar extends Foo {
        @Mapping()
        tags?: string[]
      }

      class Taz extends Bar {
        @Mapping()
        attr?: string
      }

      const taz = new Taz()
      taz.attr = 'attr'
      taz.tags = ['Hello', 'World']
      taz.name = 'taz'
      taz.id = 1

      const data: model.Data = taz.serialize()

      expect(data.id).toBe(1)
      expect(data.name).toBe('taz')
      expect(data.tags[0]).toBe('Hello')
      expect(data.tags[1]).toBe('World')
      expect(data.attr).toBe('attr')
    })

    it('序列化支持symbol数据类型', () => {
      class Employee extends Entity {
        @Mapping({path: 'idList'})
        [Symbol.iterator]?: string[]
      }

      const employee = new Employee()
      employee[Symbol.iterator] = ['Hello']

      const data: model.Data = employee.serialize()
      expect(data.idList[0]).toBe('Hello')
    })
  })

  describe('@NotBeNull()', () => {
    it('默认错误信息', () => {
      class Employee extends Entity {
        @NotBeNull()
        @Mapping()
        id?: number | null = null
      }

      const employee = new Employee()

      expect(() => {
        employee.serialize()
      }).toThrowError('在 Serialize 时: id 不能为 null')
    })

    it('自定义错误信息', () => {
      class Employee extends Entity {
        @NotBeNull('忘了写id, 忘了写id, 忘了写id, 重要的事情说三遍!')
        @Mapping()
        id?: number | null = null
      }

      const employee = new Employee()

      expect(() => {
        employee.serialize()
      }).toThrowError('忘了写id, 忘了写id, 忘了写id, 重要的事情说三遍!')
    })
  })

  describe('@NotBeUndefined()', () => {
    it('默认错误信息', () => {
      class Employee extends Entity {
        @NotBeUndefined()
        @Mapping()
        id?: number
      }

      const employee = new Employee()

      expect(() => {
        employee.serialize()
      }).toThrowError('在 Serialize 时: id 不能为 undefined')
    })

    it('自定义错误信息', () => {
      class Employee extends Entity {
        @NotBeUndefined('忘了写id, 忘了写id, 忘了写id, 重要的事情说三遍!')
        @Mapping()
        id?: number
      }

      const employee = new Employee()

      expect(() => {
        employee.serialize()
      }).toThrowError('忘了写id, 忘了写id, 忘了写id, 重要的事情说三遍!')
    })
  })

  describe('@NotBeEmpty()', () => {
    it('默认错误信息', () => {
      class Employee extends Entity {
        @NotBeEmpty()
        @Mapping()
        id?: number | null = null
      }

      const employee = new Employee()

      expect(() => {
        employee.serialize()
      }).toThrowError('在 Serialize 时: id 不能为 null 或 undefined')
    })

    it('自定义错误信息', () => {
      class Employee extends Entity {
        @NotBeEmpty('id 不能为 empty')
        @Mapping()
        id?: number | null = null
      }

      const employee = new Employee()

      expect(() => {
        employee.serialize()
      }).toThrowError('id 不能为 empty')
    })
  })
})