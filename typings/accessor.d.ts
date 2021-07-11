namespace accessor {
  export interface Expression {
    descriptor: string
    children: Expression[]
  }
}