import { Metadata } from './Metadata'

export class FieldMetadata extends Metadata implements metadata.Field {
  constructor(public readonly name: metadata.Field['name']) {
    super()
  }

  clear(): void {
    this.metadataMap.clear()
  }

  append<T extends unknown>(key: string | symbol, data: T): this {
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