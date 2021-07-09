/// <reference types="../typings/model" />

import { BaseEntity, mapping } from '../src'

describe('序列化', () => {
  it('使用mapping注解时, 序列化实例成同构数据', () => {
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

  it('使用mapping注解时, 序列化实例成异构数据', () => {
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

  it('使用mapping注解时, 序列化实例到同构复合结构数据', () => {
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
      @mapping({ path: '$.jar'})
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

  it('使用mapping注解时, 序列化实例到同构复合结构数组', () => {
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
})