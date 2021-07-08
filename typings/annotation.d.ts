
interface Annotation<T extends () => void> {
  readonly process: T
}
