export const getStorageTheme = (): string => localStorage.getItem('theme') ?? 'default'

export const setStorageTheme = (theme: string) => localStorage.setItem('theme', theme)
