import { MetadataContext } from '../metadata/MetadataContext'
import { DataModel } from './DataModel'

// eslint-disable-next-line @typescript-eslint/ban-types
export type RequestOptions = RequestInit & { params?: Object}

export abstract class ResourceModel extends DataModel implements model.ResourceModel {
  protected abstract fetch<T>(url: string, options: RequestOptions): Promise<T>

  protected getResourceById(resourceId: metadata.Resource['id']): metadata.Resource {
    const entity = MetadataContext.instance.getEntity(this.constructor.name)
    if (!entity) {
      throw new Error(`模型 ${this.constructor.name} 未注册`)
    }

    const resource = entity.getResource(resourceId)
    if (!resource) {
      throw new Error(`资源 ${resourceId.toString()} 不存在`)
    }

    return resource
  }

  private result<T extends model.DataModel>(responseData: unknown, ResponseType?: { new(): T }): T | unknown {
    if (ResponseType && Object.getPrototypeOf(ResponseType) === DataModel) {
      const instance = new ResponseType()
      instance.deserialize(responseData)

      return instance
    }

    return responseData
  }

  protected headers: HeadersInit = {}

  setHeaders(headers: HeadersInit) {
    this.headers = headers
    return this
  }

  get<T>(resourceId: string | symbol): Promise<T>
  get<T extends model.DataModel>(resourceId: string | symbol, ResponseType: new () => T): Promise<T>
  get<T>(resourceId: any, ResponseType?: any): Promise<unknown> | Promise<T> {
    const resource = this.getResourceById(resourceId)

    return this.fetch<T>(resource.url, {
      headers: this.headers,
      method: 'GET',
      params: this.serialize()
    })
      .then(responseData => this.result(responseData, ResponseType))
  }

  post<T>(resourceId: string | symbol): Promise<T>
  post<T extends model.DataModel>(resourceId: string | symbol, ResponseType: new () => T): Promise<T>
  post<T>(resourceId: any, ResponseType?: any): Promise<unknown> | Promise<T> {
    const resource = this.getResourceById(resourceId)

    return this.fetch<T>(resource.url, {
      headers: this.headers,
      method: 'POST',
      body: this.serialize()
    })
      .then(responseData => this.result(responseData, ResponseType))
  }

  put<T>(resourceId: string | symbol): Promise<T>
  put<T extends model.DataModel>(resourceId: string | symbol, ResponseType: new () => T): Promise<T>
  put<T>(resourceId: any, ResponseType?: any): Promise<unknown> | Promise<T> {
    const resource = this.getResourceById(resourceId)

    return this.fetch<T>(resource.url, {
      headers: this.headers,
      method: 'PUT',
      body: this.serialize()
    })
      .then(responseData => this.result(responseData, ResponseType))
  }

  patch<T>(resourceId: string | symbol): Promise<T>
  patch<T extends model.DataModel>(resourceId: string | symbol, ResponseType: new () => T): Promise<T>
  patch<T>(resourceId: any, ResponseType?: any): Promise<unknown> | Promise<T> {
    const resource = this.getResourceById(resourceId)

    return this.fetch<T>(resource.url, {
      headers: this.headers,
      method: 'PATCH',
      body: this.serialize()
    })
      .then(responseData => this.result(responseData, ResponseType))
  }

  delete<T>(resourceId: string | symbol): Promise<T>
  delete<T extends model.DataModel>(resourceId: string | symbol, ResponseType?: new () => T): Promise<T>
  delete<T>(resourceId: any, ResponseType?: any): Promise<unknown> | Promise<T> {
    const resource = this.getResourceById(resourceId)

    return this.fetch<T>(resource.url, {
      headers: this.headers,
      method: 'DELETE',
      body: this.serialize()
    })
      .then(responseData => this.result(responseData, ResponseType))
  }
}