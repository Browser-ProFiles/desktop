export const getStorageLang = (): string => localStorage.getItem('lang') ?? 'ru'

export const setStorageLang = (theme: string) => localStorage.setItem('lang', theme)
