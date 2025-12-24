import React from 'react'
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Alert variants
 */
export type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

/**
 * Alert component props
 */
export interface AlertProps {
    /** Alert title */
    title?: string
    /** Alert description */
    description?: string
    /** Alert children (alternative to description) */
    children?: React.ReactNode
    /** Alert variant */
    variant?: AlertVariant
    /** Container style override */
    style?: ViewStyle
    /** Title style override */
    titleStyle?: TextStyle
    /** Description style override */
    descriptionStyle?: TextStyle
}

/**
 * Alert component for displaying important messages
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!" description="Your changes have been saved." />
 * <Alert variant="error" title="Error" description="Something went wrong." />
 * ```
 */
export function Alert({
    title,
    description,
    children,
    variant = 'default',
    style,
    titleStyle,
    descriptionStyle
}: AlertProps) {
    const { theme } = useTheme()

    const getVariantStyles = (): { background: string; border: string; text: string } => {
        const variants: Record<AlertVariant, { background: string; border: string; text: string }> =
            {
                default: {
                    background: theme.colors.surface,
                    border: theme.colors.border,
                    text: theme.colors.text
                },
                success: {
                    background: theme.isDark ? 'rgba(52, 199, 89, 0.15)' : 'rgba(52, 199, 89, 0.1)',
                    border: theme.colors.success,
                    text: theme.colors.success
                },
                warning: {
                    background: theme.isDark
                        ? 'rgba(255, 149, 0, 0.15)'
                        : 'rgba(255, 149, 0, 0.1)',
                    border: theme.colors.warning,
                    text: theme.colors.warning
                },
                error: {
                    background: theme.isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)',
                    border: theme.colors.error,
                    text: theme.colors.error
                },
                info: {
                    background: theme.isDark ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.1)',
                    border: theme.colors.primary,
                    text: theme.colors.primary
                }
            }

        return variants[variant]
    }

    const variantStyles = getVariantStyles()

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: variantStyles.background,
                    borderWidth: 1,
                    borderColor: variantStyles.border,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing[4]
                },
                style
            ]}
        >
            {title && (
                <Text
                    style={[
                        styles.title,
                        {
                            color: variantStyles.text,
                            fontSize: theme.fontSizes.md,
                            fontWeight: theme.fontWeights.semibold
                        },
                        titleStyle
                    ]}
                >
                    {title}
                </Text>
            )}
            {(description || children) && (
                <Text
                    style={[
                        styles.description,
                        {
                            color: theme.colors.textSecondary,
                            fontSize: theme.fontSizes.sm,
                            marginTop: title ? theme.spacing[1] : 0
                        },
                        descriptionStyle
                    ]}
                >
                    {description || children}
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {},
    title: {},
    description: {}
})

