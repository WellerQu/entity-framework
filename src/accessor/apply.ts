export function apply(target: model.Data, expressions: accessor.Expression[], value?: unknown): unknown | void {
  if (expressions.length === 0) {
    throw new Error('表达式队列为空时, 无法操作数据')
  }

  const [expr, ...rest] = expressions

  if (isPathExpression(expr)) {
    if (rest.length === 0 && value !== undefined) {
      target[expr.path] = value
      return
    }

    if (rest.length === 0) {
      return target[expr.path]
    }

    if (target[expr.path] === undefined) {
      target[expr.path] = (isIndexExpression(rest[0]) || isSliceExpression(rest[0])) 
        ? [] 
        : {}
    }

    return apply(target[expr.path], rest, value)
  } else if (isIndexExpression(expr)) {
    if (rest.length === 0 && value !== undefined) {
      target[expr.index] = value
      return
    }

    if (rest.length === 0) {
      return target[expr.index]
    }

    if (target[expr.index] === undefined) {
      target[expr.index] = (isIndexExpression(rest[0]) || isSliceExpression(rest[0]))
        ? []
        : {}
    }

    return apply(target[expr.index], rest, value)
  } else if (isSliceExpression(expr)) {
    if (rest.length === 0 && value !== undefined) {
      if (!Array.isArray(value)) {
        throw new Error('无法将不是数组的数据赋值到切片')
      }

      const start = expr.slice[0] ?? 0
      const end = expr.slice[1] ?? (start + value.length)

      for (let i = start; i < end; i++) {
        target[i] = value[i - start]
      }

      return
    }

    if (rest.length === 0) {
      const start = expr.slice[0] ?? 0
      const end = expr.slice[1]

      return target.slice(start, end)
    }

    const start = expr.slice[0] ?? 0
    const end = expr.slice[1] ?? target.length
    const returnValue: unknown[] = []

    for (let i = start; i < end; i++) {
      returnValue.push(apply(target[i], rest, value))
    }

    return returnValue
  }

  throw new Error(`未知的表达式: ${JSON.stringify(expr)}`)
}

function isPathExpression(expr: accessor.Expression): expr is accessor.PathExpression {
  return 'path' in expr
}

function isIndexExpression(expr: accessor.Expression): expr is accessor.IndexExpression {
  return 'index' in expr
}

function isSliceExpression(expr: accessor.Expression): expr is accessor.SliceExpression {
  return 'slice' in expr
}