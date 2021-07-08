/// <reference types="../typings/model" />

import { BaseEntity, mapping } from '../src'

describe('deserialize', () => {
  it('deserialize with the mapping annotation', () => {
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

    expect(res).toEqual(data)
    expect(res.others).toBeUndefined()
  })
})