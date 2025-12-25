import React from 'react'
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'
import { FontSizeKey } from '../../theme/typography'

/**
 * Text color variants
 */
export type TextVariant =
    | 'default'
    | 'secondary'
    | 'tertiary'
    | 'muted'
    | 'primary'
    | 'success'
    | 'error'
    | 'warning'

/**
 * Text sizes
 */
export type TextSize = FontSizeKey

/**
 * Text weights
 */
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'

/**
 * Text component props
 */
export interface TextProps extends Omit<RNTextProps, 'style'> {
    /** Text variant (color) */
    variant?: TextVariant
    /** Text size */
    size?: TextSize
    /** Text weight */
    weight?: TextWeight
    /** Custom style override */
    style?: StyleProp<TextStyle>
    /** Text content */
    children?: React.ReactNode
}

/**
 * Themed Text component with consistent styling
 *
 * @example
 * ```tsx
 * <Text>Default text</Text>
 * <Text variant="primary" size="lg" weight="bold">Primary heading</Text>
 * <Text variant="secondary" size="sm">Secondary text</Text>
 * <Text variant="error">Error message</Text>
 * ```
 */
export function Text({
    variant = 'default',
    size = 'md',
    weight = 'normal',
    style,
    children,
    ...textProps
}: TextProps) {
    const { theme } = useTheme()

    const getVariantColor = (): string => {
        const variants: Record<TextVariant, string> = {
            default: theme.colors.text,
            secondary: theme.colors.textSecondary,
            tertiary: theme.colors.textTertiary,
            muted: theme.colors.textMuted,
            primary: theme.colors.primary,
            success: theme.colors.success,
            error: theme.colors.error,
            warning: theme.colors.warning
        }

        return variants[variant]
    }

    const getFontSize = (): number => {
        return theme.fontSizes[size]
    }

    const getFontWeight = (): TextStyle['fontWeight'] => {
        return theme.fontWeights[weight] as TextStyle['fontWeight']
    }

    return (
        <RNText
            style={[
                {
                    color: getVariantColor(),
                    fontSize: getFontSize(),
                    fontWeight: getFontWeight()
                },
                style
            ]}
            {...textProps}
        >
            {children}
        </RNText>
    )
}
