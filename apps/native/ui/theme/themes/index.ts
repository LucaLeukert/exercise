import { ColorTokens } from '../colors'
import { ShadowKey, ShadowStyle } from '../shadows'
import { borderRadius, spacing } from '../spacing'
import { fontSizes, fontWeights, lineHeights, typography } from '../typography'
import { darkColors, darkShadows } from './dark'
import { lightColors, lightShadows } from './light'
import { specialColors, specialShadows } from './special'

/**
 * Complete theme definition
 */
export interface Theme {
    name: string
    colors: ColorTokens
    spacing: typeof spacing
    borderRadius: typeof borderRadius
    typography: typeof typography
    fontSizes: typeof fontSizes
    fontWeights: typeof fontWeights
    lineHeights: typeof lineHeights
    shadows: Record<ShadowKey, ShadowStyle>
    isDark: boolean
}

/**
 * Theme names type
 */
export type ThemeName = 'light' | 'dark' | 'special' | string

/**
 * Pre-defined themes
 */
export const themes: Record<string, Theme> = {
    light: {
        name: 'light',
        colors: lightColors,
        spacing,
        borderRadius,
        typography,
        fontSizes,
        fontWeights,
        lineHeights,
        shadows: lightShadows as Record<ShadowKey, ShadowStyle>,
        isDark: false
    },
    dark: {
        name: 'dark',
        colors: darkColors,
        spacing,
        borderRadius,
        typography,
        fontSizes,
        fontWeights,
        lineHeights,
        shadows: darkShadows as Record<ShadowKey, ShadowStyle>,
        isDark: true
    },
    special: {
        name: 'special',
        colors: specialColors,
        spacing,
        borderRadius,
        typography,
        fontSizes,
        fontWeights,
        lineHeights,
        shadows: specialShadows as Record<ShadowKey, ShadowStyle>,
        isDark: false
    }
}

/**
 * Theme registry for managing custom themes
 */
const themeRegistry = new Map<string, Theme>(Object.entries(themes))

/**
 * Register a new theme
 */
export function registerTheme(name: string, theme: Partial<Theme> & { colors: ColorTokens }): void {
    const baseTheme = themes.light
    themeRegistry.set(name, {
        ...baseTheme,
        ...theme,
        name
    })
}

/**
 * Get a theme by name
 */
export function getTheme(name: ThemeName): Theme {
    return themeRegistry.get(name) ?? themes.light
}

/**
 * Get all registered theme names
 */
export function getThemeNames(): string[] {
    return Array.from(themeRegistry.keys())
}

/**
 * Check if a theme exists
 */
export function hasTheme(name: string): boolean {
    return themeRegistry.has(name)
}

// Export individual themes for direct access
export { lightColors, lightShadows } from './light'
export { darkColors, darkShadows } from './dark'
export { specialColors, specialShadows } from './special'
