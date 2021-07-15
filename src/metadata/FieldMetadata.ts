export class FieldMetadata implements metadata.Field {
  private metadata = new Map<string | symbol, unknown>()

  constructor(public readonly name: metadata.Field['name']) {}

  clear(): void {
    this.metadata.clear()
  }

  setMetadata<T extends unknown>(key: string | symbol, data: T): this {
    this.metadata.set(key, data)
    return this
  }

  getMetadata<T extends unknown>(key: string | symbol): T | undefined {
    return this.metadata.get(key) as T
  }

  appendMetadata<T extends unknown>(key: string | symbol, data: T): this {
    const exist = this.getMetadata(key)

    if (exist === undefined) {
      this.setMetadata(key, [data])
      return this
    }

    if (!Array.isArray(exist)) {
      throw new Error(`不能在非数组的键(${key.toString()})上追加数据`)
    }

    this.setMetadata(key, [...exist, data])

    return this
  }
}