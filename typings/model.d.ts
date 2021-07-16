namespace model {
  // 变相的表达了 any , 233333
  export type Data = Record<string, Data>

  export interface DataModel {
    /**
     * 序列化
     * @returns 原生 Object 格式的数据
     */
    serialize(): Data

    /**
     * 反序列化
     * @param data 原生 Object 格式的数据
     * @returns 实例数据
     */
    deserialize(data: Data): void
  }
}

export as namespace model