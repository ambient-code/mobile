import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { useColorScheme } from 'react-native'
import { COLORS, TOKENS } from '@/utils/constants'
import { PreferencesService } from '@/services/storage/preferences'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: 'light' | 'dark'
  themeMode: ThemeMode
  colors: typeof TOKENS
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')

  useEffect(() => {
    // Load saved theme preference
    PreferencesService.getPreferences().then((prefs) => {
      setThemeModeState(prefs.theme)
    })
  }, [])

  // Memoize setThemeMode to prevent recreation on every render
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode)
    await PreferencesService.updatePreferences({ theme: mode })
  }, [])

  // Determine actual theme based on mode and system preference
  // Memoize to prevent recalculation when dependencies haven't changed
  const theme: 'light' | 'dark' = useMemo(
    () => (themeMode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : themeMode),
    [themeMode, systemColorScheme]
  )

  // Force dark-first design: always return TOKENS
  // Keep legacy colors for backward compatibility during migration
  const colors = useMemo(() => TOKENS, [])

  // Memoize entire context value to prevent unnecessary re-renders
  // Force theme to dark for dark-first design
  const contextValue = useMemo(
    () => ({ theme: 'dark' as const, themeMode, colors, setThemeMode }),
    [themeMode, colors, setThemeMode]
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
