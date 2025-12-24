import { ColorTokens, palette } from '../colors'
import { shadowsLight, ShadowStyle } from '../shadows'

/**
 * Light theme color tokens
 */
export const lightColors: ColorTokens = {
    // Brand
    primary: palette.blue500,
    primaryForeground: palette.white,

    // Semantic
    success: palette.green500,
    successForeground: palette.white,
    error: palette.red500,
    errorForeground: palette.white,
    warning: palette.orange500,
    warningForeground: palette.white,

    // Background
    background: palette.white,
    backgroundSecondary: palette.gray50,
    surface: palette.white,
    surfaceSecondary: palette.gray100,

    // Text
    text: palette.gray900,
    textSecondary: palette.gray600,
    textTertiary: palette.gray500,
    textMuted: palette.gray400,

    // Border
    border: palette.gray200,
    borderSecondary: palette.gray300,

    // Interactive
    overlay: palette.blackAlpha50,
    ring: palette.blue500,

    // Accent
    accent: palette.blue500,
    accentForeground: palette.white
}

/**
 * Light theme shadows
 */
export const lightShadows: Record<string, ShadowStyle> = shadowsLight
