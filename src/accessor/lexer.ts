type TokenType = 'path' | 'definitive' | 'dot'
type GroupIndex = number

/**
 * 词法定义
 */
const defines: [TokenType, RegExp, GroupIndex][] = [
  ['path', /^(\w+)/, 1],
  ['dot', /^(\.)/, 1],
  ['definitive', /^(\[([^\]]*)\])/, 2]
]

export interface Token {
  type: TokenType,
  term: string
}

/**
 * 路径表达式分词器
 * @param source 原文字符串
 */
export function lex(source: string): Token[] {
  const tokens: Token[] = []

  let str = source
  while(str.length) {
    const size = str.length

    for (let i = 0; i < defines.length; i++) {
      const [type, regExp, groupIndex] = defines[i]
      const matches = regExp.exec(str)

      if (!matches) {
        continue
      }

      const token: Token = {
        type: type,
        term: matches[groupIndex]
      }

      str = str.slice(matches[1].length)

      tokens.push(token)
    }

    if (size === str.length) {
      throw new Error(`遇见未定义的词: ${str}`)
    }
  }

  return tokens
}