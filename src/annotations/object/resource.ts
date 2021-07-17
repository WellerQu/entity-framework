import { MetadataContext } from '../../metadata/MetadataContext'
import { Prepare } from './Prepare'

// eslint-disable-next-line @typescript-eslint/ban-types
type ResourceDecorator = (url: string, uid: string | symbol) => ClassDecorator

export const Resource: ResourceDecorator = (url, id) => (target) => {
  const prepare = new Prepare(MetadataContext.instance, target)
  const entity = prepare.getEntity()

  entity.setResource(id, { id, url })
}

// , ResponseType?: { new(): model.DataModel }