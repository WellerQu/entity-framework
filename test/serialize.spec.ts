/// <reference types="../typings/model" />

import { DataModel, Mapping, NotBeEmpty, NotBeNull, NotBeUndefined } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('序列化', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  describe('@Mapping()', () => {
    it('序列化实例成同构数据', () => {
      class ResponseData<T> extends DataModel {
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
      class ResponseData<T> extends DataModel {
        @Mapping()
        public data?: T

        @Mapping({ path: 'message' })
        public msg?: string
      }

      const res = new ResponseData<boolean>()
      res.data = false
      res.msg = 'success'

      const data: model.Data = res.serialize()

      expect(data.data).toBe(false)
      expect(data.message).toBe('success')
    })

    it('序列化实例成多级异构数据', () => {
      class ResponseData<T> extends DataModel {
        @Mapping()
        public data?: T

        @Mapping({ path: 'a.b.c.message' })
        public msg?: string
      }

      const res = new ResponseData<boolean>()
      res.data = false
      res.msg = 'success'

      const data: model.Data = res.serialize()

      expect(data.data).toBe(false)
      expect(data.a.b.c.message).toBe('success')
    })

    it('序列化实例到同构复合结构数据', () => {
      class Pattern extends DataModel {
        @Mapping()
        public id?: number

        @Mapping({ relatedEntityDescriptor: 'Strategy' })
        public strategy?: Strategy
      }

      class Strategy extends DataModel {
        @Mapping()
        name?: string

        @Mapping({ relatedEntityDescriptor: 'Metric' })
        metric?: Metric
      }

      class Metric extends DataModel {
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
      class LogSource extends DataModel {
        @Mapping()
        name?: string

        @Mapping({ relatedEntityDescriptor: 'Category[]' })
        categories?: Category[]
      }

      class Category extends DataModel {
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

    it('序列化实例到数组结构数据 [提供初始化引用]', () => {
      class CategorySet extends DataModel {
        @Mapping({ path: '[]' })
        categories?: string[]
      }

      const set = new CategorySet()
      set.categories = ['c1', 'c2', 'c3']

      const data: model.Data = set.serialize([])

      expect(data[0]).toBe('c1')
      expect(data[1]).toBe('c2')
      expect(data[2]).toBe('c3')
      expect(data).toBeInstanceOf(Array)
    })

    it('序列化实例数据到数组结构 [提供初始化引用]', () => {
      class CategorySet extends DataModel {
        @Mapping({ path: '[0]' })
        id?: number

        @Mapping({ path: '[1:]' })
        categories?: string[]
      }

      const set = new CategorySet()
      set.id = 1
      set.categories = ['c1', 'c2', 'c3']

      const data: model.Data = set.serialize([])

      expect(data[0]).toBe(1)
      expect(data[1]).toBe('c1')
      expect(data[2]).toBe('c2')
      expect(data[3]).toBe('c3')
      expect(data).toBeInstanceOf(Array)
    })

    it('序列化实例到复合结构数组的特定位置 [n]', () => {
      class LogSource extends DataModel {
        @Mapping()
        name?: string
      }

      class Category extends DataModel {
        @Mapping()
        name?: string
      }

      class Rule extends DataModel {
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
    })

    it('序列化递归数据结构', () => {
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
    })

    it('序列化实例到混合切片数据 [n:m]', () => {
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
    })

    it('序列化实例到切片数据 [:]', () => {
      class Foo extends DataModel {
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
      class Foo extends DataModel {
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
      class Foo extends DataModel {
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
      class Foo extends DataModel {
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

    it('序列化间接继承 DataModel 的类型实例', () => {
      class Foo extends DataModel {
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
      class Employee extends DataModel {
        @Mapping({path: 'idList'})
        [Symbol.iterator]?: string[]
      }

      const employee = new Employee()
      employee[Symbol.iterator] = ['Hello']

      const data: model.Data = employee.serialize()
      expect(data.idList[0]).toBe('Hello')
    })

    it('自定义序列化过程', () => {
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
    })
  })

  describe('@NotBeNull()', () => {
    it('默认错误信息', () => {
      class Employee extends DataModel {
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
      class Employee extends DataModel {
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
      class Employee extends DataModel {
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
      class Employee extends DataModel {
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
      class Employee extends DataModel {
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
      class Employee extends DataModel {
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