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
 * aaa.bbb[n].ccc
 * aaa.bbb[:].ccc
 * aaa.bbb[n:].ccc
 * aaa.bbb[:m].ccc
 * aaa.bbb[:m].ccc
 * @param path 数据访问路径
 * @returns 路径访问表达式
 */
export function parse(path: string): accessor.Expression[] {
  return path.split('.').map(item => {
    const regExp = /^([^[]+)(\[(-?\d+)?(:)?(-?\d+)?\])?/
    const matches = regExp.exec(item)

    if (!matches) {
      throw new Error('无法识别的路径表达式')
    }

    /*
     * 字符串 "wbc[:]" 匹配结果如下:
     * Match 0: wbc[:]
     * Group 1: wbc
     * Group 2: [:]
     * Group 3: <empty>
     * Group 4: :
     * Group 5: <empty>
     * 
     * https://regexr.com/3eg8l
     */

    if (!matches[2]) {
      const expression: accessor.Expression = {
        key: matches[1],
      }
      return expression
    }

    if (matches[4] || !matches[3] && !matches[5]) {
      const start = toNumber(matches[3])
      const end = toNumber(matches[5])

      const expression: accessor.SliceExpression = {
        key: matches[1],
        slice: [start, end]
      }

      return expression
    }

    const expression: accessor.IndexExpression = {
      key: matches[1],
      index: toNumber(matches[3])!
    }

    return expression
  })
}

function toNumber(anything: unknown): number | undefined {
  const num = +String(anything)
  if (isNaN(num)) {
    return undefined
  }

  return num
}