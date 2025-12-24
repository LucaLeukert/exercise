import { ColorTokens, palette } from '../colors'
import { shadowsDark, ShadowStyle } from '../shadows'

/**
 * Dark theme color tokens
 * Uses iOS system dark mode colors for native feel
 */
export const darkColors: ColorTokens = {
    // Brand
    primary: palette.blue600,
    primaryForeground: palette.white,

    // Semantic
    success: palette.green600,
    successForeground: palette.white,
    error: palette.red600,
    errorForeground: palette.white,
    warning: palette.orange600,
    warningForeground: palette.gray900,

    // Background
    background: palette.gray900,
    backgroundSecondary: palette.darkGray1,
    surface: palette.darkGray2,
    surfaceSecondary: palette.darkGray3,

    // Text
    text: palette.darkLabel,
    textSecondary: palette.darkLabelSecondary,
    textTertiary: palette.darkLabelTertiary,
    textMuted: palette.darkGray5,

    // Border
    border: palette.darkGray3,
    borderSecondary: palette.darkGray4,

    // Interactive
    overlay: palette.blackAlpha50,
    ring: palette.blue600,

    // Accent
    accent: palette.blue600,
    accentForeground: palette.white
}

/**
 * Dark theme shadows
 */
export const darkShadows: Record<string, ShadowStyle> = shadowsDark
