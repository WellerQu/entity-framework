/// <reference types="../typings/accessor" />

import { parse } from '../src/accessor/parser'

describe.only("数据访问路径表达式", () => {
  it('aaa', () => {
    const expr = parse('aaa')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        key: 'aaa'
      }
    ])
  })

  it('aaa[]', () => {
    const expr = parse('aaa[]')

    expect(expr).toEqual<accessor.SliceExpression[]>([
      {
        key: 'aaa',
        slice: [undefined, undefined]
      }
    ])
  })

  it('aaa[n]', () => {
    const expr = parse('aaa[2]')

    expect(expr).toEqual<accessor.IndexExpression[]>([
      {
        key: 'aaa',
        index: 2
      }
    ])
  })
  
  it('aaa[:]', () => {
    const expr = parse('aaa[:]')

    expect(expr).toEqual<accessor.SliceExpression[]>([
      {
        key: 'aaa',
        slice: [undefined, undefined]
      }
    ])
  })

  it('aaa[n:]', () => {
    const expr = parse('aaa[2:]')

    expect(expr).toEqual<accessor.SliceExpression[]>([
      {
        key: 'aaa',
        slice: [2, undefined]
      }
    ])
  })

  it('aaa[:m]', () => {
    const expr = parse('aaa[:4]')

    expect(expr).toEqual<accessor.SliceExpression[]>([
      {
        key: 'aaa',
        slice: [undefined, 4]
      }
    ])
  })

  it('aaa[n:m]', () => {
    const expr = parse('aaa[2:4]')

    expect(expr).toEqual<accessor.SliceExpression[]>([
      {
        key: 'aaa',
        slice: [2, 4]
      }
    ])
  })

  it('aaa.bbb', () => {
    const expr = parse('aaa.bbb')

    expect(expr).toEqual<[accessor.Expression, accessor.Expression]>([
      {
        key: 'aaa'
      },
      {
        key: 'bbb'
      }
    ])
  })

  it('aaa.bbb[n:m].ccc', () => {
    const expr = parse('aaa.bbb[2:4].ccc[4]')

    expect(expr).toEqual<[accessor.Expression, accessor.SliceExpression, accessor.IndexExpression]>([
      {
        key: 'aaa'
      },
      {
        key: 'bbb',
        slice: [2, 4]
      },
      {
        key: 'ccc',
        index: 4
      }
    ])
  })
})