import { apply } from './apply'
import { parse } from './parser'

export class Accessor {
  private expressions: accessor.Expression[]

  constructor(private target: model.Data, path: string) {
    this.expressions = parse(path)
  }

  setValue(value: unknown): void {
    apply(this.target, this.expressions, value)
  }

  getValue<T>(): T {
    return apply(this.target, this.expressions) as T
  }
}