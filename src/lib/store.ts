export async function getStore(key: string): Promise<string | null> {
  return window.api.store.get(key)
}

export async function setStore(key: string, value: string): Promise<void> {
  return window.api.store.set(key, value)
}
