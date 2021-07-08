namespace model {
  export type Data = Record<string, unknown>

  export interface Entity {
    serialize(): Data
    deserialize(data: Data): Entity
  }
}

export as namespace model