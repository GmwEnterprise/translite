export type Lang = 'zh' | 'en'

const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/g

export function detectLang(text: string): Lang {
  const matches = text.match(CJK_REGEX)
  const cjkCount = matches ? matches.length : 0
  const ratio = cjkCount / text.length
  return ratio > 0.3 ? 'zh' : 'en'
}
