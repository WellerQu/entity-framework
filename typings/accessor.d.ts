namespace accessor {
  export type Expression = PathExpression | IndexExpression | SliceExpression

  export interface PathExpression {
    path: string
  }

  export interface IndexExpression {
    index: number
  }

  export interface SliceExpression {
    slice: [undefined, undefined] | [undefined, number] | [number, undefined] | [number, number]
  }
}

export as namespace accessor