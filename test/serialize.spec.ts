/// <reference types="../typings/model" />

import { BaseEntity, mapping } from '../src'

describe('serialize', () => {
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

      @mapping('message')
      public msg?: string
    }

    const res = new ResponseData<boolean>()
    const data: model.Data = { data: true, message: 'success', code: 0 }

    res.deserialize(data)

    expect(res.data).toBe(data.data)
    expect(res.msg).toBe(data.message)
  })
})