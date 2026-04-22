import { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { darkColors, lightColors, type AppColors } from '@/constants/themes'

type ThemeMode = 'dark' | 'light'

type ThemeContextType = {
  Colors: AppColors
  theme: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  Colors: darkColors,
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark')

  useEffect(() => {
    SecureStore.getItemAsync('theme').then(v => {
      if (v === 'light' || v === 'dark') setTheme(v)
    })
  }, [])

  const toggleTheme = async () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    await SecureStore.setItemAsync('theme', next)
  }

  const Colors = theme === 'dark' ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ Colors, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useColors = () => useContext(ThemeContext).Colors
export const useTheme = () => useContext(ThemeContext)
