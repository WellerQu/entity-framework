import { parse } from "./parser"

export class Accessor {
  private expressions: accessor.Expression

  constructor(private target: object, path: string) {
    this.expressions = parse(path)
  }

  setValue<T>(value: T): void {
    
  }

  getValue<T>(): T {
    return {} as T
  }
}