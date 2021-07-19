/// <reference types="../typings/model" />

import { DataModel, Mapping, NotBeEmpty, NotBeNull, NotBeUndefined } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('反序列化', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  describe('@Mapping()', () => {
    it('反序列化同构数据到实例', () => {
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
      const data: model.Data = { data: true, msg: 'success', code: 0 }

      res.deserialize(data)

      expect(res.code).toEqual(data.code)
      expect(res.msg).toEqual(data.msg)
      expect(res.data).toEqual(data.data)
      expect(res.others).toBeUndefined()
    })

    it('反序列化异构数据到实例', () => {
      class ResponseData<T> extends DataModel {
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

    it('反序列化多级异构数据到实例', () => {
      class ResponseData<T> extends DataModel {
        @Mapping()
        public data?: T

        @Mapping({ path: 'a.b.c.message' })
        public msg?: string
      }

      const data: model.Data = { data: false, a: { b: { c: { message: 'success' } } } }

      const res = new ResponseData<boolean>()
      res.deserialize(data)

      expect(res.data).toBe(false)
      expect(res.msg).toBe('success')
    })

    it('反序列化同构复合结构数据到实例', () => {
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
      const data: model.Data = { id: 1, strategy: { name: 'foo', metric: { jar: 'bar' } } }

      pattern.deserialize(data)

      expect(pattern.id).toBe(1)
      expect(pattern.strategy?.name).toBe('foo')
      expect(pattern.strategy).toBeInstanceOf(Strategy)
      expect(pattern.strategy?.metric?.bar).toBe('bar')
      expect(pattern.strategy?.metric).toBeInstanceOf(Metric)
    })

    it('反序列化同构复合结构数组到实例', () => {
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

      logSource.deserialize({
        name: 'foo',
        categories: [{
          name: 'c1'
        }, {
          name: 'c2'
        }]
      })

      expect(logSource.name).toBe('foo')
      expect(logSource.categories).not.toBeUndefined()
      expect(logSource.categories).toHaveLength(2)
      expect(logSource.categories?.[0].name).toBe('c1')
      expect(logSource.categories?.[0]).toBeInstanceOf(Category)
      expect(logSource.categories?.[1].name).toBe('c2')
      expect(logSource.categories?.[1]).toBeInstanceOf(Category)
    })

    it('反序列化数组结构数据到实例', () => {
      class CategorySet extends DataModel {
        @Mapping({ path: '[]' })
        categories?: string[]
      }

      const data: model.Data =  ['c1', 'c2', 'c3']

      const set = new CategorySet()
      set.deserialize(data)

      expect(set.categories?.[0]).toBe('c1')
      expect(set.categories?.[1]).toBe('c2')
      expect(set.categories?.[2]).toBe('c3')
      expect(set.categories).toBeInstanceOf(Array)
    })

    it('反序列化数组结构数据到实例', () => {
      class CategorySet extends DataModel {
        @Mapping({ path: '[0]' })
        id?: number

        @Mapping({ path: '[1:]' })
        categories?: string[]
      }

      const data: model.Data = [24, 'c1', 'c2', 'c3']

      const set = new CategorySet()
      set.deserialize(data)

      expect(set.id).toBe(24)
      expect(set.categories?.[0]).toBe('c1')
      expect(set.categories?.[1]).toBe('c2')
      expect(set.categories?.[2]).toBe('c3')
      expect(set.categories).toBeInstanceOf(Array)
    })

    it('反序列化复合结构数组的特定位置到实例 [n]', () => {
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

      const data: model.Data = {
        filters: [{ 'name': 'logSource' }, { 'name': 'category' }]
      }

      const rule = new Rule()
      rule.deserialize(data)

      expect(rule.logSource?.name).toBe('logSource')
      expect(rule.category?.name).toBe('category')
    })

    it('反序列化复合结构数组的特定位置到实例 [n][m]', () => {
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

      const data: model.Data = {
        filters: [[undefined, { 'name': 'logSource' }], [undefined, undefined, { 'name': 'category' }]]
      }

      const rule = new Rule()
      rule.deserialize(data)

      expect(rule.logSource?.name).toBe('logSource')
      expect(rule.category?.name).toBe('category')
    })

    it('反序列化递归数据结构', () => {
      class Pattern extends DataModel {
        @Mapping()
        id?: number

        @Mapping()
        name?: string

        @Mapping({ relatedEntityDescriptor: 'Pattern' })
        pattern?: Pattern
      }

      const data: model.Data = {
        id: 1,
        name: 'P1',
        pattern: {
          id: 2,
          name: 'P2'
        }
      }

      const pattern = new Pattern()
      pattern.deserialize(data)

      expect(pattern.id).toBe(1)
      expect(pattern.name).toBe('P1')
      expect(pattern.pattern?.id).toBe(2)
      expect(pattern.pattern?.name).toBe('P2')
      expect(pattern.pattern).toBeInstanceOf(Pattern)
    })

    it('反序列化混合切片数据到实例 [n:m]', () => {
      class Foo extends DataModel {
        @Mapping({ path: 'filters[0]' })
        id?: number

        @Mapping({ path: 'filters[1]' })
        name?: string

        @Mapping({ path: 'filters[2:3]' })
        children?: string[]
      }

      const data: model.Data = {
        filters: [
          1,
          'foo',
          'Hello',
          'World'
        ]
      }

      const foo = new Foo()
      foo.deserialize(data)

      expect(foo.id).toBe(1)
      expect(foo.name).toBe('foo')
      expect(foo.children?.[0]).toBe('Hello')
      expect(foo.children?.[1]).toBeUndefined()
    })

    it('反序列化切片数据到实例 [:]', () => {
      class Foo extends DataModel {
        @Mapping({ path: 'filters[:]' })
        filters?: number[]
      }

      const data: model.Data = { filters: [1, 2, 3, 4, 5] }

      const foo = new Foo()
      foo.deserialize(data)

      expect(foo.filters).toHaveLength(5)
      expect(foo.filters?.[0]).toBe(1)
      expect(foo.filters?.[1]).toBe(2)
      expect(foo.filters?.[2]).toBe(3)
      expect(foo.filters?.[3]).toBe(4)
      expect(foo.filters?.[4]).toBe(5)
    })

    it('反序列化切片数据到实例 []', () => {
      class Foo extends DataModel {
        @Mapping({ path: 'filters[]' })
        filters?: number[]
      }

      const data: model.Data = { filters: [1, 2, 3, 4, 5] }

      const foo = new Foo()
      foo.deserialize(data)

      expect(foo.filters).toHaveLength(5)
      expect(foo.filters?.[0]).toBe(1)
      expect(foo.filters?.[1]).toBe(2)
      expect(foo.filters?.[2]).toBe(3)
      expect(foo.filters?.[3]).toBe(4)
      expect(foo.filters?.[4]).toBe(5)
    })

    it('反序列化切片数据到实例 [n:]', () => {
      class Foo extends DataModel {
        @Mapping({ path: 'filters[2:]' })
        filters?: number[]
      }

      const data: model.Data = { filters: [undefined, undefined, 1, 2, 3, 4, 5] }

      const foo = new Foo()
      foo.deserialize(data)

      expect(foo.filters).toHaveLength(5)
      expect(foo.filters?.[0]).toBe(1)
      expect(foo.filters?.[1]).toBe(2)
      expect(foo.filters?.[2]).toBe(3)
      expect(foo.filters?.[3]).toBe(4)
      expect(foo.filters?.[4]).toBe(5)
    })

    it('反序列化切片数据到实例 [:m]', () => {
      class Foo extends DataModel {
        @Mapping({ path: 'filters[:4]' })
        filters?: number[]
      }

      const data: model.Data = { filters: [1, 2, 3, 4, 5] }

      const foo = new Foo()
      foo.deserialize(data)

      expect(foo.filters).toHaveLength(4)
      expect(foo.filters?.[0]).toBe(1)
      expect(foo.filters?.[1]).toBe(2)
      expect(foo.filters?.[2]).toBe(3)
      expect(foo.filters?.[3]).toBe(4)
      expect(foo.filters?.[4]).toBeUndefined()
    })

    it('反序列化间接继承 Entity 的类型实例', () => {
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

      const data: model.Data = { id: 1, name: 'taz', tags: ['Hello', 'World'], attr: 'attr' }
      taz.deserialize(data)

      expect(taz.attr).toBe('attr')
      expect(taz.id).toBe(1)
      expect(taz.name).toBe('taz')
      expect(taz.tags?.[0]).toBe('Hello')
      expect(taz.tags?.[1]).toBe('World')
    })

    it('反序列化支持symbol数据类型', () => {
      class Employee extends DataModel {
        @Mapping({ path: 'idList' })
        [Symbol.iterator]?: string[]
      }

      const data: model.Data = { idList: ['Hello'] }

      const employee = new Employee()
      employee.deserialize(data)

      expect(employee[Symbol.iterator]?.[0]).toBe('Hello')
    })

    it('自定义序列化过程', () => {
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
      const data: model.Data = {
        id: null
      }

      expect(() => {
        employee.deserialize(data)
      }).toThrowError('在 Deserialize 时: id 不能为 null')
    })

    it('自定义错误信息', () => {
      class Employee extends DataModel {
        @NotBeNull('忘了写id, 忘了写id, 忘了写id, 重要的事情说三遍!')
        @Mapping()
        id?: number | null = null
      }

      const employee = new Employee()
      const data: model.Data = {
        id: null
      }

      expect(() => {
        employee.deserialize(data)
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
      const data: model.Data = {
        id: undefined
      }

      expect(() => {
        employee.deserialize(data)
      }).toThrowError('在 Deserialize 时: id 不能为 undefined')
    })

    it('自定义错误信息', () => {
      class Employee extends DataModel {
        @NotBeUndefined('忘了写id, 忘了写id, 忘了写id, 重要的事情说三遍!')
        @Mapping()
        id?: number
      }

      const employee = new Employee()
      const data: model.Data = {
        id: undefined
      }

      expect(() => {
        employee.deserialize(data)
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
      const data: model.Data = {
        id: undefined
      }

      expect(() => {
        employee.deserialize(data)
      }).toThrowError('在 Deserialize 时: id 不能为 null 或 undefined')
    })

    it('自定义错误信息', () => {
      class Employee extends DataModel {
        @NotBeEmpty('id 不能为 empty')
        @Mapping()
        id?: number | null = null
      }

      const employee = new Employee()
      const data: model.Data = {
        id: undefined
      }

      expect(() => {
        employee.deserialize(data)
      }).toThrowError('id 不能为 empty')
    })
  })
})