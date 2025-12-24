import { useContext } from 'react'
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native'

import { ThemeContext, ThemeContextValue } from '../theme/ThemeProvider'
import { Theme } from '../theme/themes'

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
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }

    return context
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

