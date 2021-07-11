import { lex, Token } from "./lexer"

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
export function parse(path: string): accessor.Expression {
  const tokens = lex(path)
  const analysis: accessor.Expression[] = []

  for (let current of tokens) {
    switch(current.type) {
      case 'colon':
        continue
      case 'leftBracket':
        break
      case 'rightBracket':
        break
      case 'number':
        break
      case 'path':
        break
    }
  }

  if (analysis.length === 0) {
    throw new Error('无法解析路径表达式')
  }

  return analysis[0]
}

function toNumber(anything: unknown): number | undefined {
  const num = +String(anything)
  if (isNaN(num)) {
    return undefined
  }

  return num
}