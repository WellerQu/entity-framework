/**
 * 验证是否是 model.Entity
 * @param target 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isEntity(target: Object): target is model.Entity {
  return ('serialize' in target && 'deserialize' in target)
}