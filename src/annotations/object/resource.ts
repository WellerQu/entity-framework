import { MetadataContext } from '../../metadata/MetadataContext'
import { Prepare } from './Prepare'

type ResourceDecorator = (url: string, uid: string | symbol) => ClassDecorator

export const Resource: ResourceDecorator = (url, id) => (target) => {
  const prepare = new Prepare(MetadataContext.instance, target)
  const entity = prepare.getEntity()

  entity.setResource(id, { id, url })
}
