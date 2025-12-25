import React from 'react'
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Badge variants
 */
export type BadgeVariant =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning'
    | 'outline'

/**
 * Badge sizes
 */
export type BadgeSize = 'sm' | 'md' | 'lg'

/**
 * Badge component props
 */
export interface BadgeProps {
    /** Badge text content */
    children: React.ReactNode
    /** Badge variant */
    variant?: BadgeVariant
    /** Badge size */
    size?: BadgeSize
    /** Custom style override */
    style?: ViewStyle
    /** Custom text style override */
    textStyle?: TextStyle
}

/**
 * Badge/Chip component for tags, labels, and status indicators
 *
 * @example
 * ```tsx
 * <Badge>Default</Badge>
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" size="sm">Error</Badge>
 * ```
 */
export function Badge({
    children,
    variant = 'default',
    size = 'md',
    style,
    textStyle
}: BadgeProps) {
    const { theme } = useTheme()

    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
        const variants: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
            default: {
                container: { backgroundColor: theme.colors.surfaceSecondary },
                text: { color: theme.colors.text }
            },
            primary: {
                container: { backgroundColor: theme.colors.primary },
                text: { color: theme.colors.primaryForeground }
            },
            secondary: {
                container: { backgroundColor: theme.colors.surfaceSecondary },
                text: { color: theme.colors.textSecondary }
            },
            success: {
                container: { backgroundColor: theme.colors.success },
                text: { color: theme.colors.successForeground }
            },
            error: {
                container: { backgroundColor: theme.colors.error },
                text: { color: theme.colors.errorForeground }
            },
            warning: {
                container: { backgroundColor: theme.colors.warning },
                text: { color: theme.colors.warningForeground }
            },
            outline: {
                container: {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.colors.border
                },
                text: { color: theme.colors.text }
            }
        }

        return variants[variant]
    }

    const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
        const sizes: Record<BadgeSize, { container: ViewStyle; text: TextStyle }> = {
            sm: {
                container: {
                    paddingHorizontal: theme.spacing[2],
                    paddingVertical: theme.spacing[0.5],
                    borderRadius: theme.borderRadius.sm
                },
                text: {
                    fontSize: theme.fontSizes.xs,
                    fontWeight: theme.fontWeights.medium
                }
            },
            md: {
                container: {
                    paddingHorizontal: theme.spacing[2.5],
                    paddingVertical: theme.spacing[1],
                    borderRadius: theme.borderRadius.md
                },
                text: {
                    fontSize: theme.fontSizes.sm,
                    fontWeight: theme.fontWeights.medium
                }
            },
            lg: {
                container: {
                    paddingHorizontal: theme.spacing[3],
                    paddingVertical: theme.spacing[1.5],
                    borderRadius: theme.borderRadius.lg
                },
                text: {
                    fontSize: theme.fontSizes.md,
                    fontWeight: theme.fontWeights.medium
                }
            }
        }

        return sizes[size]
    }

    const variantStyles = getVariantStyles()
    const sizeStyles = getSizeStyles()

    // Check if children is a primitive (string, number) that needs to be wrapped in Text
    const isPrimitive =
        typeof children === 'string' || typeof children === 'number' || children == null

    return (
        <View style={[styles.badge, sizeStyles.container, variantStyles.container, style]}>
            {isPrimitive ? (
                <Text style={[sizeStyles.text, variantStyles.text, textStyle]}>{children}</Text>
            ) : (
                children
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start'
    }
})
