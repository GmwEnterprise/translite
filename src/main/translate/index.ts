import type { TranslateSource, TranslateSourceInfo } from './types'

const sources = new Map<string, TranslateSource>()

export function registerSource(source: TranslateSource): void {
  sources.set(source.id, source)
}

export function getSource(id: string): TranslateSource | undefined {
  return sources.get(id)
}

export function getAllSources(): TranslateSourceInfo[] {
  return [...sources.values()].map((s) => ({ id: s.id, name: s.name }))
}
