/// <reference types="../typings/accessor" />

import { parse } from '../src/accessor/parser'

describe('数据访问路径表达式', () => {
  it('aaa', () => {
    const expr = parse('aaa')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa'
      }
    ])
  })

  it('aaa[]', () => {
    const expr = parse('aaa[]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa',
      },
      {
        slice: [undefined, undefined]
      }
    ])
  })

  it('aaa[n]', () => {
    const expr = parse('aaa[2]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa',
      },
      {
        index: 2
      }
    ])
  })
  
  it('aaa[:]', () => {
    const expr = parse('aaa[:]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa',
      },
      {
        slice: [undefined, undefined]
      }
    ])
  })

  it('aaa[n:]', () => {
    const expr = parse('aaa[2:]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa',
      },
      {
        slice: [2, undefined]
      }
    ])
  })

  it('aaa[:m]', () => {
    const expr = parse('aaa[:4]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa',
      },
      {
        slice: [undefined, 4]
      }
    ])
  })

  it('aaa[n:m]', () => {
    const expr = parse('aaa[2:4]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa'
      },
      {
        slice: [2, 4]
      }
    ])
  })

  it('aaa.bbb', () => {
    const expr = parse('aaa.bbb')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa'
      },
      {
        path: 'bbb'
      }
    ])
  })

  it('aaa.bbb[2:4][0]', () => {
    const expr = parse('aaa.bbb[2:4][0]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa'
      },
      {
        path: 'bbb'
      },
      {
        slice: [2, 4]
      },
      {
        index: 0
      }
    ])
  })

  it('aaa.bbb[n:m].ccc', () => {
    const expr = parse('aaa.bbb[2:4].ccc[4]')

    expect(expr).toEqual<accessor.Expression[]>([
      {
        path: 'aaa'
      },
      {
        path: 'bbb'
      },
      {
        slice: [2, 4]
      },
      {
        path: 'ccc'
      },
      {
        index: 4
      }
    ])
  })
})