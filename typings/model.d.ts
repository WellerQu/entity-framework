namespace model {
  // 变相的表达了 any , 233333
  export type Data = Record<string, Data>

  export interface DataModel {
    /**
     * 序列化
     * @param initial 原生 Object 数据的初始化引用
     * @returns 原生 Object 格式的数据
     */
    serialize(initial?: Data): Data

    /**
     * 反序列化
     * @param data 原生 Object 格式的数据
     * @returns 实例数据
     */
    deserialize(data: Data): void
  }
}

export as namespace model