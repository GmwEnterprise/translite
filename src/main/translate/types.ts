export interface TranslateOptions {
  text: string
  from: string
  to: string
  signal?: AbortSignal
  onChunk: (chunk: string) => void
}

export interface TranslateSource {
  readonly id: string
  readonly name: string
  translate(options: TranslateOptions): Promise<void>
}

export interface TranslateSourceInfo {
  id: string
  name: string
}
