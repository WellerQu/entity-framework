/// <reference types="../typings/accessor" />

import { parse } from '../src/accessor/parser'

describe.only("数据访问路径表达式", () => {
  it('aaa', () => {
    const expr = parse('aaa')
  })

  it('aaa[]', () => {
    const expr = parse('aaa[]')
  })

  it('aaa[n]', () => {
    const expr = parse('aaa[2]')
  })
  
  it('aaa[:]', () => {
    const expr = parse('aaa[:]')
  })

  it('aaa[n:]', () => {
    const expr = parse('aaa[2:]')
  })

  it('aaa[:m]', () => {
    const expr = parse('aaa[:4]')
  })

  it('aaa[n:m]', () => {
    const expr = parse('aaa[2:4]')
  })

  it('aaa.bbb[2:4][0]', () => {
    const expr = parse('aaa.bbb[2:4][0]')
  })

  it('aaa.bbb', () => {
    const expr = parse('aaa.bbb')
  })

  it('aaa.bbb[n:m].ccc', () => {
    const expr = parse('aaa.bbb[2:4].ccc[4]')
  })
})