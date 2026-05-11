import { useState, useEffect } from 'react'
import { getStore, setStore } from './store'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    getStore('theme').then((v) => {
      const t: Theme = v === 'light' ? 'light' : 'dark'
      setTheme(t)
      document.documentElement.setAttribute('data-theme', t)
    })
  }, [])

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    setStore('theme', next)
  }

  return { theme, toggleTheme }
}
