import { ColorTokens, palette } from '../colors'
import { shadowsLight, ShadowStyle } from '../shadows'

/**
 * Special theme - can be customized for events
 * This example uses a vibrant workout/fitness aesthetic
 */
export const specialColors: ColorTokens = {
    // Brand - vibrant coral/orange
    primary: '#FF6B35',
    primaryForeground: palette.white,

    // Semantic
    success: '#00D9A5',
    successForeground: palette.white,
    error: '#FF4757',
    errorForeground: palette.white,
    warning: '#FFA502',
    warningForeground: palette.gray900,

    // Background - warm tones
    background: '#FFFBF7',
    backgroundSecondary: '#FFF5ED',
    surface: palette.white,
    surfaceSecondary: '#FFF0E5',

    // Text
    text: '#2D3436',
    textSecondary: '#636E72',
    textTertiary: '#B2BEC3',
    textMuted: '#DFE6E9',

    // Border
    border: '#FFE8D6',
    borderSecondary: '#FFD9BE',

    // Interactive
    overlay: 'rgba(45, 52, 54, 0.5)',
    ring: '#FF6B35',

    // Accent - energetic teal
    accent: '#00D9A5',
    accentForeground: palette.white
}

/**
 * Special theme shadows (slightly warmer)
 */
export const specialShadows: Record<string, ShadowStyle> = {
    ...shadowsLight,
    md: {
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    lg: {
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4
    }
}

