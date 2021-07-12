/// <reference types="../typings/model" />

import { BaseEntity, mapping } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('序列化', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  describe('@mapping()', () => {
    it('序列化实例成同构数据', () => {
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
      res.code = 0
      res.data = true
      res.msg = 'success'
      res.others = 'anything'

      const data: model.Data = res.serialize()

      expect(data.others).toBeUndefined()
      expect(data).toEqual({ data: true, msg: 'success', code: 0 })
    })

    it('序列化实例成异构数据', () => {
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

    it('序列化实例到同构复合结构数据', () => {
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
    })
  })
})