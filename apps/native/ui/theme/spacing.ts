/**
 * Spacing scale for consistent layout
 * Based on 4px base unit
 */

export const spacing = {
    /** 0px */
    0: 0,
    /** 2px */
    0.5: 2,
    /** 4px */
    1: 4,
    /** 6px */
    1.5: 6,
    /** 8px */
    2: 8,
    /** 10px */
    2.5: 10,
    /** 12px */
    3: 12,
    /** 14px */
    3.5: 14,
    /** 16px */
    4: 16,
    /** 20px */
    5: 20,
    /** 24px */
    6: 24,
    /** 28px */
    7: 28,
    /** 32px */
    8: 32,
    /** 36px */
    9: 36,
    /** 40px */
    10: 40,
    /** 44px */
    11: 44,
    /** 48px */
    12: 48,
    /** 56px */
    14: 56,
    /** 64px */
    16: 64,
    /** 80px */
    20: 80,
    /** 96px */
    24: 96
} as const

export type SpacingKey = keyof typeof spacing

/**
 * Border radius values
 */
export const borderRadius = {
    /** 0px */
    none: 0,
    /** 4px */
    sm: 4,
    /** 8px */
    md: 8,
    /** 12px */
    lg: 12,
    /** 16px */
    xl: 16,
    /** 20px */
    '2xl': 20,
    /** 24px */
    '3xl': 24,
    /** 9999px - full rounded */
    full: 9999
} as const

export type BorderRadiusKey = keyof typeof borderRadius

