/// <reference types="../typings/model" />

import { DataModel, Mapping } from '../src'
import { MetadataContext } from '../src/metadata/MetadataContext'

describe('Real world', () => {
  beforeEach(() => {
    MetadataContext.instance.clear()
  })

  it('创建指标', () => {
    class Condition extends DataModel {
      constructor(action: string, id: number, name: string) {
        super()

        this.action = action
        this.fieldId = id
        this.fieldName = name
      }

      @Mapping()
      action?: string
      @Mapping()
      fieldId?: number
      @Mapping()
      fieldName?: string
    }

    class StreamMetric extends DataModel {
      @Mapping()
      sourceId?: number

      @Mapping()
      sourceName?: string

      @Mapping({ path: 'category' })
      sourceCategory?: string

      @Mapping({ relatedEntityDescriptor: 'Condition[]' })
      conditions?: Condition[]
    }

    const metric = new StreamMetric()
    metric.sourceId = 123
    metric.sourceName = 'GuangDong Development of Bank'
    metric.sourceCategory = 'Kafka'
    metric.conditions = [
      new Condition('source', 1, '_data_source'),
      new Condition('category', 2, '_category')
    ]

    const data: model.Data = metric.serialize()

    expect(data.sourceId).toBe(123)
    expect(data.sourceName).toBe('GuangDong Development of Bank')
    expect(data.category).toBe('Kafka')
    expect(data.conditions).toBeInstanceOf(Array)
    expect(data.conditions[0].action).toBe('source')
    expect(data.conditions[1].action).toBe('category')
  })
})