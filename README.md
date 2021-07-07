# SPL Input

提供 X-Bizseer 项目日志模块中将 SPL 转译为 ES DSL 的功能

## 用法

```typescript
// # typescript

import { transferFactory } from 'spl-parser'

const transfer = transferFactory()
const dsl: elasticsearch.ESQuery = transfer('* | stats count(_application) as cnt')

/*
interface ESQuery {
  // NOTE: ES DSL 要求的命名风格
  query: {
    'query_string': {
      query: string,
      'default_field': '_message'
    }
  },
  from?: number
  size?: number
  _source?: string[]
  aggs?: ESQueryStatisticAggr,
  sort?: ESQuerySort[] | undefined
  'script_fields'?: ScriptFields
}
*/
```

## 更多用法

参考测试用例