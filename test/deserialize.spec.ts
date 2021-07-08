/// <reference types="../typings/model" />

import { BaseEntity, mapping } from '../src'

describe('deserialize', () => {
  it('deserialize the same name fields with the mapping annotation', () => {
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

  it('deserialize the different name fields with the mapping annotation', () => {
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