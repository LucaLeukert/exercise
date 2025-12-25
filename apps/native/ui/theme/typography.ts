import { TextStyle } from 'react-native'

/**
 * Typography scale for consistent text styling
 */

export const fontSizes = {
    /** 10px */
    xs: 10,
    /** 12px */
    sm: 12,
    /** 14px */
    md: 14,
    /** 16px */
    lg: 16,
    /** 18px */
    xl: 18,
    /** 20px */
    '2xl': 20,
    /** 24px */
    '3xl': 24,
    /** 28px */
    '4xl': 28,
    /** 32px */
    '5xl': 32,
    /** 36px */
    '6xl': 36
} as const

export type FontSizeKey = keyof typeof fontSizes

export const fontWeights = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const
}

export type FontWeightKey = keyof typeof fontWeights

export const lineHeights = {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8
} as const

export type LineHeightKey = keyof typeof lineHeights

/**
 * Pre-defined typography styles
 */
export const typography: Record<string, TextStyle> = {
    // Display styles
    display: {
        fontSize: fontSizes['5xl'],
        fontWeight: fontWeights.extrabold,
        lineHeight: fontSizes['5xl'] * lineHeights.tight
    },

    // Heading styles
    h1: {
        fontSize: fontSizes['4xl'],
        fontWeight: fontWeights.bold,
        lineHeight: fontSizes['4xl'] * lineHeights.tight
    },
    h2: {
        fontSize: fontSizes['3xl'],
        fontWeight: fontWeights.bold,
        lineHeight: fontSizes['3xl'] * lineHeights.tight
    },
    h3: {
        fontSize: fontSizes['2xl'],
        fontWeight: fontWeights.semibold,
        lineHeight: fontSizes['2xl'] * lineHeights.normal
    },
    h4: {
        fontSize: fontSizes.xl,
        fontWeight: fontWeights.semibold,
        lineHeight: fontSizes.xl * lineHeights.normal
    },

    // Body styles
    bodyLg: {
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.normal,
        lineHeight: fontSizes.lg * lineHeights.relaxed
    },
    body: {
        fontSize: fontSizes.md,
        fontWeight: fontWeights.normal,
        lineHeight: fontSizes.md * lineHeights.relaxed
    },
    bodySm: {
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.normal,
        lineHeight: fontSizes.sm * lineHeights.relaxed
    },

    // Label styles
    labelLg: {
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        lineHeight: fontSizes.lg * lineHeights.normal
    },
    label: {
        fontSize: fontSizes.md,
        fontWeight: fontWeights.medium,
        lineHeight: fontSizes.md * lineHeights.normal
    },
    labelSm: {
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
        lineHeight: fontSizes.sm * lineHeights.normal
    },

    // Caption/small text
    caption: {
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.normal,
        lineHeight: fontSizes.xs * lineHeights.normal
    }
}

export type TypographyVariant = keyof typeof typography
