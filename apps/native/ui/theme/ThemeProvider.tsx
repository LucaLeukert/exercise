import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { ColorTokens } from './colors'
import { getTheme, getThemeNames, hasTheme, registerTheme, Theme, ThemeName } from './themes'

const THEME_STORAGE_KEY = '@app/theme'

export interface ThemeContextValue {
    /** Current theme object with all tokens */
    theme: Theme
    /** Current theme name */
    themeName: ThemeName
    /** Set theme by name */
    setTheme: (name: ThemeName) => void
    /** Toggle between light and dark themes */
    toggleTheme: () => void
    /** Register a custom theme */
    registerCustomTheme: (name: string, theme: Partial<Theme> & { colors: ColorTokens }) => void
    /** List of all available theme names */
    availableThemes: string[]
    /** Whether the current theme is dark */
    isDark: boolean
    /** System color scheme preference */
    systemColorScheme: 'light' | 'dark' | null
    /** Whether to follow system color scheme */
    followSystem: boolean
    /** Set whether to follow system color scheme */
    setFollowSystem: (follow: boolean) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
    children: React.ReactNode
    /** Initial theme name (default: 'light') */
    defaultTheme?: ThemeName
    /** Whether to follow system color scheme by default */
    defaultFollowSystem?: boolean
}

export function ThemeProvider({
    children,
    defaultTheme = 'light',
    defaultFollowSystem = true
}: ThemeProviderProps) {
    const systemColorScheme = useColorScheme()
    const [themeName, setThemeName] = useState<ThemeName>(defaultTheme)
    const [followSystem, setFollowSystemState] = useState(defaultFollowSystem)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load persisted theme preference on mount
    useEffect(() => {
        async function loadTheme() {
            try {
                const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY)
                if (stored) {
                    const { theme, followSystem: storedFollowSystem } = JSON.parse(stored)
                    if (hasTheme(theme)) {
                        setThemeName(theme)
                    }
                    if (typeof storedFollowSystem === 'boolean') {
                        setFollowSystemState(storedFollowSystem)
                    }
                }
            } catch (error) {
                console.warn('Failed to load theme preference:', error)
            } finally {
                setIsLoaded(true)
            }
        }
        loadTheme()
    }, [])

    // Persist theme preference
    const persistTheme = useCallback(async (name: ThemeName, follow: boolean) => {
        try {
            await AsyncStorage.setItem(
                THEME_STORAGE_KEY,
                JSON.stringify({ theme: name, followSystem: follow })
            )
        } catch (error) {
            console.warn('Failed to persist theme preference:', error)
        }
    }, [])

    // Determine the effective theme based on settings
    const effectiveThemeName = useMemo(() => {
        if (followSystem && systemColorScheme) {
            return systemColorScheme
        }
        return themeName
    }, [followSystem, systemColorScheme, themeName])

    const theme = useMemo(() => getTheme(effectiveThemeName), [effectiveThemeName])

    const setTheme = useCallback(
        (name: ThemeName) => {
            if (hasTheme(name)) {
                setThemeName(name)
                persistTheme(name, followSystem)
            } else {
                console.warn(`Theme "${name}" not found. Available themes:`, getThemeNames())
            }
        },
        [followSystem, persistTheme]
    )

    const toggleTheme = useCallback(() => {
        const newTheme = theme.isDark ? 'light' : 'dark'
        setTheme(newTheme)
        if (followSystem) {
            setFollowSystemState(false)
            persistTheme(newTheme, false)
        }
    }, [theme.isDark, setTheme, followSystem, persistTheme])

    const setFollowSystem = useCallback(
        (follow: boolean) => {
            setFollowSystemState(follow)
            persistTheme(themeName, follow)
        },
        [themeName, persistTheme]
    )

    const registerCustomTheme = useCallback(
        (name: string, themeConfig: Partial<Theme> & { colors: ColorTokens }) => {
            registerTheme(name, themeConfig)
        },
        []
    )

    const availableThemes = useMemo(() => getThemeNames(), [])

    const value: ThemeContextValue = useMemo(
        () => ({
            theme,
            themeName: effectiveThemeName,
            setTheme,
            toggleTheme,
            registerCustomTheme,
            availableThemes,
            isDark: theme.isDark,
            systemColorScheme,
            followSystem,
            setFollowSystem
        }),
        [
            theme,
            effectiveThemeName,
            setTheme,
            toggleTheme,
            registerCustomTheme,
            availableThemes,
            systemColorScheme,
            followSystem,
            setFollowSystem
        ]
    )

    // Don't render until theme is loaded to prevent flash
    if (!isLoaded) {
        return null
    }

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

