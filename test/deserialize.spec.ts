/// <reference types="../typings/model" />

import { BaseEntity, mapping } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('反序列化', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  describe('@mapping()', () => {
    it('反序列化同构数据到实例', () => {
      class ResponseData<T> extends BaseEntity {
        @mapping()
        public data?: T

        @mapping()
        public msg?: string

        @mapping()
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
      class ResponseData<T> extends BaseEntity {
        @mapping()
        public data?: T

        @mapping({ path: 'message' })
        public msg?: string
      }

      const res = new ResponseData<boolean>()
      const data: model.Data = { data: true, message: 'success', code: 0 }

      res.deserialize(data)

      expect(res.data).toBe(data.data)
      expect(res.msg).toBe(data.message)
    })

    it('反序列化同构复合结构数据到实例', () => {
      class Pattern extends BaseEntity {
        @mapping()
        public id?: number

        @mapping({ relatedEntityDescriptor: 'Strategy' })
        public strategy?: Strategy
      }

      class Strategy extends BaseEntity {
        @mapping()
        name?: string

        @mapping({ relatedEntityDescriptor: 'Metric' })
        metric?: Metric
      }

      class Metric extends BaseEntity {
        @mapping({ path: 'jar' })
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
      class LogSource extends BaseEntity {
        @mapping()
        name?: string

        @mapping({ relatedEntityDescriptor: 'Category[]' })
        categories?: Category[]
      }

      class Category extends BaseEntity {
        @mapping()
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
      class LogSource extends BaseEntity {
        @mapping()
        name?: string
      }

      class Category extends BaseEntity {
        @mapping()
        name?: string
      }

      class Rule extends BaseEntity {
        // logSource 使用 filters 的第 0 位置
        @mapping({ relatedEntityDescriptor: 'LogSource', path: 'filters[0]' })
        logSource?: LogSource

        // category 使用 filters 的第 1 位置
        @mapping({ relatedEntityDescriptor: 'Category', path: 'filters[1]' })
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
      class LogSource extends BaseEntity {
        @mapping()
        name?: string
      }

      class Category extends BaseEntity {
        @mapping()
        name?: string
      }

      class Rule extends BaseEntity {
        // logSource 使用 filters 的第 0 位置
        @mapping({ relatedEntityDescriptor: 'LogSource', path: 'filters[0][1]' })
        logSource?: LogSource

        // category 使用 filters 的第 1 位置
        @mapping({ relatedEntityDescriptor: 'Category', path: 'filters[1][2]' })
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
      class Pattern extends BaseEntity {
        @mapping()
        id?: number

        @mapping()
        name?: string

        @mapping({ relatedEntityDescriptor: 'Pattern' })
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

    it('序列化示例到切片数据中', () => {
      class Foo extends BaseEntity {
        @mapping({ path: 'filters[0]' })
        id?: number

        @mapping({ path: 'filters[1]' })
        name?: string

        @mapping({ path: 'filters[2:3]' })
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
  })
})