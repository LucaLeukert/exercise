/**
 * Color token types for the design system
 * All color values are semantic and theme-aware
 */

export interface ColorTokens {
    // Brand colors
    primary: string
    primaryForeground: string

    // Semantic colors
    success: string
    successForeground: string
    error: string
    errorForeground: string
    warning: string
    warningForeground: string

    // Background colors
    background: string
    backgroundSecondary: string
    surface: string
    surfaceSecondary: string

    // Text colors
    text: string
    textSecondary: string
    textTertiary: string
    textMuted: string

    // Border colors
    border: string
    borderSecondary: string

    // Interactive states
    overlay: string
    ring: string

    // Accent (for special themes)
    accent: string
    accentForeground: string
}

/**
 * Base color palette - raw color values
 * These are used to build theme-specific color tokens
 */
export const palette = {
    // Blues
    blue50: '#E3F2FD',
    blue100: '#BBDEFB',
    blue500: '#007AFF',
    blue600: '#0A84FF',

    // Greens
    green50: '#E8F5E9',
    green500: '#34C759',
    green600: '#30D158',

    // Reds
    red50: '#FFEBEE',
    red500: '#FF3B30',
    red600: '#FF453A',

    // Oranges
    orange50: '#FFF3E0',
    orange500: '#FF9500',
    orange600: '#FF9F0A',

    // Grays (light mode)
    white: '#FFFFFF',
    gray50: '#F9F9F9',
    gray100: '#F5F5F5',
    gray200: '#F0F0F0',
    gray300: '#E0E0E0',
    gray400: '#CCCCCC',
    gray500: '#999999',
    gray600: '#666666',
    gray700: '#333333',
    gray800: '#1A1A1A',
    gray900: '#000000',

    // Grays (dark mode - iOS system colors)
    darkGray1: '#1C1C1E',
    darkGray2: '#2C2C2E',
    darkGray3: '#38383A',
    darkGray4: '#48484A',
    darkGray5: '#636366',
    darkGray6: '#8E8E93',
    darkLabel: '#FFFFFF',
    darkLabelSecondary: '#EBEBF5',
    darkLabelTertiary: '#8E8E93',

    // Transparent
    transparent: 'transparent',
    blackAlpha50: 'rgba(0, 0, 0, 0.5)',
    blackAlpha30: 'rgba(0, 0, 0, 0.3)',
    whiteAlpha50: 'rgba(255, 255, 255, 0.5)',
    whiteAlpha30: 'rgba(255, 255, 255, 0.3)'
} as const

