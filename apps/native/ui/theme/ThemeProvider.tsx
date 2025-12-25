import React, { useEffect, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { useThemeStore } from '@/store/store'

import { getTheme } from './themes'

export interface ThemeProviderProps {
    children: React.ReactNode
    /** Initial theme name (default: 'light') */
    defaultTheme?: string
    /** Whether to follow system color scheme by default */
    defaultFollowSystem?: boolean
}

export function ThemeProvider({
    children,
    defaultTheme = 'light',
    defaultFollowSystem = true
}: ThemeProviderProps) {
    const systemColorScheme = useColorScheme()
    const { isLoaded, followSystem, themeName, initializeTheme, updateSystemColorScheme } =
        useThemeStore()

    // Initialize theme on mount
    useEffect(() => {
        void initializeTheme(defaultTheme, defaultFollowSystem)
    }, [initializeTheme, defaultTheme, defaultFollowSystem])

    // Update system color scheme when it changes
    useEffect(() => {
        updateSystemColorScheme(systemColorScheme ?? null)
    }, [systemColorScheme, updateSystemColorScheme])


    // Don't render until theme is loaded to prevent flash
    if (!isLoaded) {
        return null
    }

    return <>{children}</>
}
