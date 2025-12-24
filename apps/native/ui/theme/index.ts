/**
 * Theme system exports
 */

// Color tokens
export { palette } from './colors'
export type { ColorTokens } from './colors'

// Spacing and layout
export { spacing, borderRadius } from './spacing'
export type { SpacingKey, BorderRadiusKey } from './spacing'

// Typography
export { typography, fontSizes, fontWeights, lineHeights } from './typography'
export type { FontSizeKey, FontWeightKey, LineHeightKey, TypographyVariant } from './typography'

// Shadows
export { shadowsLight, shadowsDark, applyShadow } from './shadows'
export type { ShadowStyle, ShadowKey } from './shadows'

// Theme definitions
export { themes, getTheme, registerTheme, getThemeNames, hasTheme } from './themes'
export type { Theme, ThemeName } from './themes'

// Theme provider
export { ThemeProvider } from './ThemeProvider'
export type { ThemeProviderProps } from './ThemeProvider'

