namespace accessor {
  export interface Expression {
    key: string
  }

  export interface IndexExpression extends Expression {
    index: number
  }

  export interface SliceExpression extends Expression {
    slice: [number, undefined] | [undefined, number] | [undefined, undefined] | [number, number]
  }
}