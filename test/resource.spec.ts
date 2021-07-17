/// <reference types="../typings/model" />
/// <reference types="../typings/metadata" />

import { DataModel, Mapping, Resource, ResourceModel } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('resource', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  class RequestBean extends ResourceModel {
    protected fetch<T>(): Promise<T> {
      return Promise.resolve<T>({
        metricId: '256'
      } as unknown as T)
    }
  }

  it('get()', async () => {
    class Metric extends DataModel {
      @Mapping({ path: 'metricId' })
      id?: string
    }

    @Resource('/v1/api/query', 'query')
    class MetricQuery extends RequestBean {
      @Mapping({ path: 'metricId' })
      id?: string
      @Mapping({ path: 'metricName' })
      name?: string
    }

    const query = new MetricQuery()
    query.id = '123'
    query.name = 'bean'

    const responseBean = await query.get('query', Metric)

    expect(responseBean.id).toBe('256')
  })

  it('post()', async () => {
    class Metric extends DataModel {
      @Mapping({ path: 'metricId' })
      id?: string
    }

    @Resource('/v1/api/create', 'create')
    class MetricPost extends RequestBean {
      @Mapping({ path: 'metricId' })
      id?: string
      @Mapping({ path: 'metricName' })
      name?: string
    }

    const bean = new MetricPost()
    bean.id = '123'
    bean.name = 'bean'

    const responseBean = await bean.post('create', Metric)

    expect(responseBean.id).toBe('256')
  })

  it('put()', async () => {
    class Metric extends DataModel {
      @Mapping({ path: 'metricId' })
      id?: string
    }

    @Resource('/v1/api/update', 'update')
    class MetricUpdate extends RequestBean {
      @Mapping({ path: 'metricId' })
      id?: string
      @Mapping({ path: 'metricName' })
      name?: string
    }

    const bean = new MetricUpdate()
    bean.id = '123'
    bean.name = 'bean'

    const responseBean = await bean.put('update', Metric)

    expect(responseBean.id).toBe('256')
  })

  it('patch()', async () => {
    class Metric extends DataModel {
      @Mapping({ path: 'metricId' })
      id?: string
    }

    @Resource('/v1/api/update', 'update')
    class MetricUpdate extends RequestBean {
      @Mapping({ path: 'metricId' })
      id?: string
      @Mapping({ path: 'metricName' })
      name?: string
    }

    const bean = new MetricUpdate()
    bean.id = '123'
    bean.name = 'bean'

    const responseBean = await bean.patch('update', Metric)

    expect(responseBean.id).toBe('256')
  })

  it('delete()', async () => {
    class Metric extends DataModel {
      @Mapping({ path: 'metricId' })
      id?: string
    }

    @Resource('/v1/api/delete', 'delete')
    class MetricDelete extends RequestBean {
      @Mapping({ path: 'metricId' })
      id?: string
      @Mapping({ path: 'metricName' })
      name?: string
    }

    const bean = new MetricDelete()
    bean.id = '123'
    bean.name = 'bean'

    const responseBean = await bean.delete('delete', Metric)

    expect(responseBean.id).toBe('256')
  })

  it('origin data', async () => {
    @Resource('/v1/api/delete', 'delete')
    class MetricDelete extends RequestBean {
      @Mapping({ path: 'metricId' })
      id?: string
      @Mapping({ path: 'metricName' })
      name?: string
    }

    const bean = new MetricDelete()
    bean.id = '123'
    bean.name = 'bean'

    const originData = await bean.delete<{ metricId: string }>('delete')
    expect(originData.metricId).toBe('256')
  })
})