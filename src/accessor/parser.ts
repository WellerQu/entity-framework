import { lex } from './lexer'

/**
 * 解析数据访问路径 (Data Access Path)
 * 
 * aaa
 * aaa[]
 * aaa[n]
 * aaa[:]
 * aaa[n:]
 * aaa[:m]
 * aaa[n:m]
 * aaa.bbb
 * aaa.bbb[]
 * aaa.bbb[n]
 * aaa.bbb[:]
 * aaa.bbb[n:]
 * aaa.bbb[:m]
 * aaa.bbb[n:m]
 * aaa.bbb[n:m][n] **
 * aaa.bbb[n].ccc
 * aaa.bbb[:].ccc
 * aaa.bbb[n:].ccc
 * aaa.bbb[:m].ccc
 * aaa.bbb[:m].ccc
 * @param path 数据访问路径
 * @returns 路径访问表达式
 */
export function parse(path: string): accessor.Expression[] {
  const tokens = lex(path)
  const analysis: accessor.Expression[] = []

  for (let i = 0;i<tokens.length;i++) {
    const current = tokens[i]

    if (current.type === 'dot') {
      continue
    }
    if (current.type === 'path') {
      analysis.push({
        path: current.term
      })
    }
    else if (current.type === 'definitive') {
      const definitive = resolveDefinitive(current.term)
      if (Array.isArray(definitive)) {
        analysis.push({
          slice: definitive
        })
      } else {
        analysis.push({
          index: definitive
        })
      }
    }
    else {
      throw new Error(`未知的Token类型: ${current.type}`)
    }
  }
 
  if (analysis.length === 0) {
    throw new Error('无法解析路径表达式')
  }

  return analysis
}

function toNumber(anything: unknown): number | undefined {
  const num = +String(anything)
  if (isNaN(num)) {
    return undefined
  }

  return num
}

function resolveDefinitive(term: string): accessor.IndexExpression['index'] | accessor.SliceExpression['slice'] {
  const regExp = /^(-?\d+)?(:)?(-?\d+)?$/i
  const matches = regExp.exec(term)

  if (!matches) {
    throw new Error(`限定语法错误: ${term}`)
  }

  const start = toNumber(matches[1])
  const colon = matches[2]
  const end = toNumber(matches[3])

  if (start !== undefined && colon === undefined && end === undefined) {
    return start
  }
  
  return [start, end]
}