import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native'

import { useThemeStore } from '@/store/store'
import { Theme } from '../theme/themes'

export interface ThemeContextValue {
    /** Current theme object with all tokens */
    theme: Theme
    /** Current theme name */
    themeName: string
    /** Set theme by name */
    setTheme: (name: string) => Promise<void>
    /** Toggle between light and dark themes */
    toggleTheme: () => Promise<void>
    /** Register a custom theme */
    registerCustomTheme: (name: string, theme: Partial<Theme> & { colors: Theme['colors'] }) => void
    /** List of all available theme names */
    availableThemes: string[]
    /** Whether the current theme is dark */
    isDark: boolean
    /** System color scheme preference */
    systemColorScheme: 'light' | 'dark' | null
    /** Whether to follow system color scheme */
    followSystem: boolean
    /** Set whether to follow system color scheme */
    setFollowSystem: (follow: boolean) => Promise<void>
}

/**
 * Hook to access the current theme and theme utilities
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, isDark, toggleTheme } = useTheme()
 *
 *   return (
 *     <View style={{ backgroundColor: theme.colors.background }}>
 *       <Text style={{ color: theme.colors.text }}>Hello</Text>
 *       <Button onPress={toggleTheme} title={isDark ? 'Light' : 'Dark'} />
 *     </View>
 *   )
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
    const {
        theme,
        themeName,
        setTheme,
        toggleTheme,
        registerCustomTheme,
        availableThemes,
        isDark,
        systemColorScheme,
        followSystem,
        setFollowSystem
    } = useThemeStore()

    return {
        theme,
        themeName,
        setTheme,
        toggleTheme,
        registerCustomTheme,
        availableThemes,
        isDark,
        systemColorScheme,
        followSystem,
        setFollowSystem
    }
}

/**
 * Helper type for style creator function
 */
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle }
type StyleCreator<T extends NamedStyles<T>> = (theme: Theme) => T

/**
 * Create themed styles that automatically update when theme changes
 *
 * @example
 * ```tsx
 * const useStyles = createThemedStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing[4],
 *   },
 *   text: {
 *     color: theme.colors.text,
 *     ...theme.typography.body,
 *   },
 * }))
 *
 * function MyComponent() {
 *   const styles = useStyles()
 *   return <View style={styles.container}><Text style={styles.text}>Hello</Text></View>
 * }
 * ```
 */
export function createThemedStyles<T extends NamedStyles<T>>(
    styleCreator: StyleCreator<T>
): () => T {
    return function useStyles(): T {
        const { theme } = useTheme()
        return StyleSheet.create(styleCreator(theme)) as T
    }
}

/**
 * Get themed color by path
 * Useful for components that need a single color value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const primary = useThemeColor('primary')
 *   const textColor = useThemeColor('text')
 *   return <Ionicons color={primary} />
 * }
 * ```
 */
export function useThemeColor(colorKey: keyof Theme['colors']): string {
    const { theme } = useTheme()
    return theme.colors[colorKey]
}

/**
 * Get themed spacing value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const padding = useThemeSpacing(4) // 16px
 *   return <View style={{ padding }} />
 * }
 * ```
 */
export function useThemeSpacing(key: keyof Theme['spacing']): number {
    const { theme } = useTheme()
    return theme.spacing[key]
}

/**
 * Get themed shadow by elevation level
 *
 * @example
 * ```tsx
 * function MyCard() {
 *   const shadow = useThemeShadow('md')
 *   return <View style={[styles.card, shadow]} />
 * }
 * ```
 */
export function useThemeShadow(level: keyof Theme['shadows']): ViewStyle {
    const { theme } = useTheme()
    return theme.shadows[level]
}
