namespace model {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Data = Record<string, any>

  export interface Entity {
    serialize(): Data
    deserialize(data: Data): void
  }
}

export as namespace model