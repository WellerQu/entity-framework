/// <reference types="../typings/model" />

import { Entity, Mapping } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('反序列化', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  describe('@Mapping()', () => {
    it('反序列化同构数据到实例', () => {
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
      const data: model.Data = { data: true, msg: 'success', code: 0 }

      res.deserialize(data)

      expect(res.code).toEqual(data.code)
      expect(res.msg).toEqual(data.msg)
      expect(res.data).toEqual(data.data)
      expect(res.others).toBeUndefined()
    })

    it('反序列化异构数据到实例', () => {
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

    it('反序列化同构复合结构数据到实例', () => {
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
      const data: model.Data = { id: 1, strategy: { name: 'foo', metric: { jar: 'bar' } } }

      pattern.deserialize(data)

      expect(pattern.id).toBe(1)
      expect(pattern.strategy?.name).toBe('foo')
      expect(pattern.strategy).toBeInstanceOf(Strategy)
      expect(pattern.strategy?.metric?.bar).toBe('bar')
      expect(pattern.strategy?.metric).toBeInstanceOf(Metric)
    })

    it('反序列化同构复合结构数组到实例', () => {
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

    it('反序列化复合结构数组的特定位置到实例 [n]', () => {
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

      const data: model.Data = {
        filters: [{ 'name': 'logSource' }, { 'name': 'category' }]
      }

      const rule = new Rule()
      rule.deserialize(data)

      expect(rule.logSource?.name).toBe('logSource')
      expect(rule.category?.name).toBe('category')
    })

    it('反序列化复合结构数组的特定位置到实例 [n][m]', () => {
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

      const data: model.Data = {
        filters: [[undefined, { 'name': 'logSource' }], [undefined, undefined, { 'name': 'category' }]]
      }

      const rule = new Rule()
      rule.deserialize(data)

      expect(rule.logSource?.name).toBe('logSource')
      expect(rule.category?.name).toBe('category')
    })

    it('反序列化递归数据结构', () => {
      class Pattern extends Entity {
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
      class Foo extends Entity {
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
      class Foo extends Entity {
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
      class Foo extends Entity {
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
      class Foo extends Entity {
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
      class Foo extends Entity {
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

      const data: model.Data = { id: 1, name: 'taz', tags: ['Hello', 'World'], attr: 'attr' }
      taz.deserialize(data)

      expect(taz.attr).toBe('attr')
      expect(taz.id).toBe(1)
      expect(taz.name).toBe('taz')
      expect(taz.tags?.[0]).toBe('Hello')
      expect(taz.tags?.[1]).toBe('World')
    })

    it('反序列化支持symbol数据类型', () => {
      class Employee extends Entity {
        @Mapping({ path: 'idList' })
        [Symbol.iterator]?: string[]
      }

      const data: model.Data = { idList: ['Hello'] }

      const employee = new Employee()
      employee.deserialize(data)

      expect(employee[Symbol.iterator]?.[0]).toBe('Hello')
    })
  })
})