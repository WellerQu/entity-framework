/// <reference types="../typings/model" />

import { BaseEntity, mapping } from '../src'

describe('serialize', () => {
  it('serialize the same name with the mapping annotation', () => {
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

  it('serialize the different name fields with the mapping annotation', () => {
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