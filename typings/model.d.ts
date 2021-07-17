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

  export interface ResourceModel {
    /**
     * 以 GET 方式请求资源
     * @param resourceId 资源唯一标识
     */
    async get<T>(resourceId: string | symbol, headers?: RequestInit['headers']): Promise<T>
    /**
     * 以 POST 方式请求资源
     * @param resourceId 资源唯一标识
     */
    async post<T>(resourceId: string | symbol, headers?: RequestInit['headers']): Promise<T>
    /**
     * 以 PUT 方式请求资源
     * @param resourceId 资源唯一标识
     */
    async put<T>(resourceId: string | symbol, headers?: RequestInit['headers']): Promise<T>
    /**
     * 以 PATCH 方式请求资源
     * @param resourceId 资源唯一标识
     */
    async patch<T>(resourceId: string | symbol, headers?: RequestInit['headers']): Promise<T>
    /**
     * 以 DELETE 方式请求资源
     * @param resourceId 资源唯一标识
     */
    async delete<T>(resourceId: string | symbol, headers?: RequestInit['headers']): Promise<T>
  }
}

export as namespace model