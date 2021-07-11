enum TokenType {
  path = 'path',
  leftBracket = 'leftBracket',
  rightBracket = 'rightBracket',
  number = 'number',
  colon = 'colon'
}

type GroupIndex = number
/**
 * 词法定义
 */
const defines: [keyof typeof TokenType, RegExp, GroupIndex][] = [
  ['path', /^(\w+)/, 1],
  ['leftBracket', /^(\[)/, 1],
  ['rightBracket', /^(\])/, 1],
  ['number', /^(-?\d+)/, 1],
  ['colon', /^(:)/, 1]
]

export interface Token {
  type: keyof typeof TokenType,
  term: string
  startIndex: number
  length: number
}

/**
 * 路径表达式分词器
 * @param source 原文字符串
 */
export function* lex(source: string): Generator<Token, void, Token | undefined> {
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
        term: matches[groupIndex],
        startIndex: source.length - str.length,
        length: matches[groupIndex].length
      }

      str = str.slice(token.length)

      yield token
    }

    if (size === str.length) {
      throw new Error(`遇见未定义的词: ${str}`)
    }
  }
}