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

  private result<T>(resource: metadata.Resource, responseData: unknown): T {
    if (!resource.ResponseType) {
      return responseData as T
    }

    const instance = new resource.ResponseType()
    instance.deserialize(responseData ?? {})

    return instance as unknown as T
  }

  async get<T>(resourceId: metadata.Resource['id'], headers?: Headers): Promise<T> {
    const resource = this.getResourceById(resourceId)

    const responseData = await this.fetch<T>(resource.url, {
      headers,
      method: 'GET',
      params: this.serialize()
    })

    return this.result(resource, responseData)
  }

  async post<T>(resourceId: metadata.Resource['id'], headers?: Headers): Promise<T> {
    const resource = this.getResourceById(resourceId)

    const responseData = await this.fetch(resource.url, {
      headers,
      method: 'POST',
      body: this.serialize()
    })

    return this.result(resource, responseData)
  }

  async put<T>(resourceId: string | symbol, headers?: Headers): Promise<T> {
    const resource = this.getResourceById(resourceId)

    const responseData = await this.fetch<T>(resource.url, {
      headers,
      method: 'PUT',
      body: this.serialize()
    })

    return this.result(resource, responseData)
  }

  async patch<T>(resourceId: string | symbol, headers?: Headers): Promise<T> {
    const resource = this.getResourceById(resourceId)

    const responseData = await this.fetch<T>(resource.url, {
      headers,
      method: 'PATCH',
      body: this.serialize()
    })

    return this.result(resource, responseData)
  }

  async delete<T>(resourceId: string | symbol, headers?: Headers): Promise<T> {
    const resource = this.getResourceById(resourceId)

    const responseData = await this.fetch<T>(resource.url, {
      headers,
      method: 'DELETE',
      body: this.serialize()
    })

    return this.result(resource, responseData)
  }
}