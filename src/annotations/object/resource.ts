import { MetadataContext } from '../../metadata/MetadataContext'
import { Prepare } from './Prepare'

// eslint-disable-next-line @typescript-eslint/ban-types
type ResourceDecorator = (url: string, uid: string | symbol, ResponseType?: { new(): model.DataModel }) => ClassDecorator

export const Resource: ResourceDecorator = (url, id, ResponseType) => (target) => {
  const prepare = new Prepare(MetadataContext.instance, target)
  const entity = prepare.getEntity()

  entity.setResource(id, { id, url, ResponseType })
}