namespace metadata {
  export interface Metadata {
    /**
     * 设置元数据
     * @param key 访问数据的键
     * @param data 元数据
     */
    setMetadata<T extends unknown>(key: string | symbol, data: T): ThisType
    /**
     * 获取元数据
     * @param key 访问数据的键
     */
    getMetadata<T extends unknown>(key: string | symbol): T | undefined
    /**
     * 清除所有元数据
     */
    clear(): void
  }

  export interface Entity extends Metadata {
    readonly name: string

    getField(name: Field['name']): Field | undefined
    getFields(): Field[]
    setField(field: Field): void

    createInstance<T extends model.DataModel>(data?: model.Data): T
  }

  export interface Field extends Metadata {
    readonly name: string | symbol

    /**
     * 追加元数据, 要求访问数据的键所对应的值的数据类型为数组类型, 否则会得到一个异常
     * @param key 访问数据的键
     * @param data 追加的元数据
     */
    append<T extends unknown>(key: string | symbol, data: T): ThisType
  }
}

export as namespace metadata