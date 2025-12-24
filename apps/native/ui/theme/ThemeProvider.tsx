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
        void initializeTheme()
    }, [initializeTheme])

    // Update system color scheme when it changes
    useEffect(() => {
        updateSystemColorScheme(systemColorScheme ?? null)
    }, [systemColorScheme, updateSystemColorScheme])

    // Compute effective theme and update store when following system
    const effectiveThemeName = useMemo(() => {
        if (followSystem && systemColorScheme) {
            return systemColorScheme
        }
        return themeName
    }, [followSystem, systemColorScheme, themeName])

    useEffect(() => {
        if (!isLoaded) return

        // Only update theme if we're following system AND the effective theme changed
        if (followSystem && systemColorScheme) {
            const effectiveTheme = getTheme(effectiveThemeName)
            const currentState = useThemeStore.getState()

            // Only update if the effective theme is different from current
            if (currentState.theme.name !== effectiveThemeName) {
                useThemeStore.setState({
                    theme: effectiveTheme,
                    isDark: effectiveTheme.isDark,
                    themeName: effectiveThemeName
                })
            }
        }
        // If not following system, the theme is already set correctly by setTheme()
    }, [isLoaded, followSystem, systemColorScheme, effectiveThemeName])

    // Don't render until theme is loaded to prevent flash
    if (!isLoaded) {
        return null
    }

    return <>{children}</>
}
