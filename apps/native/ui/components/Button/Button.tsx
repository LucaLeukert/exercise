import React, { forwardRef } from 'react'
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native'

import { useTheme } from '../../hooks/useTheme'
import { Theme } from '../../theme/themes'

/**
 * Button variants for different use cases
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Button component props
 */
export interface ButtonProps extends Omit<PressableProps, 'style'> {
    /** Button visual variant */
    variant?: ButtonVariant
    /** Button size */
    size?: ButtonSize
    /** Button text content */
    title?: string
    /** Show loading spinner */
    loading?: boolean
    /** Left icon element */
    leftIcon?: React.ReactNode
    /** Right icon element */
    rightIcon?: React.ReactNode
    /** Full width button */
    fullWidth?: boolean
    /** Custom style override */
    style?: ViewStyle
    /** Custom text style override */
    textStyle?: TextStyle
    /** Children (alternative to title) */
    children?: React.ReactNode
}

/**
 * Get variant-specific styles
 */
function getVariantStyles(
    variant: ButtonVariant,
    theme: Theme,
    pressed: boolean,
    disabled: boolean
): { container: ViewStyle; text: TextStyle } {
    const baseOpacity = disabled ? 0.5 : pressed ? 0.8 : 1

    const variants: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
        primary: {
            container: {
                backgroundColor: theme.colors.primary,
                opacity: baseOpacity
            },
            text: {
                color: theme.colors.primaryForeground
            }
        },
        secondary: {
            container: {
                backgroundColor: theme.colors.surfaceSecondary,
                opacity: baseOpacity
            },
            text: {
                color: theme.colors.text
            }
        },
        ghost: {
            container: {
                backgroundColor: pressed ? theme.colors.surfaceSecondary : 'transparent',
                opacity: disabled ? 0.5 : 1
            },
            text: {
                color: theme.colors.primary
            }
        },
        destructive: {
            container: {
                backgroundColor: theme.colors.error,
                opacity: baseOpacity
            },
            text: {
                color: theme.colors.errorForeground
            }
        },
        outline: {
            container: {
                backgroundColor: pressed ? theme.colors.surfaceSecondary : 'transparent',
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: disabled ? 0.5 : 1
            },
            text: {
                color: theme.colors.text
            }
        }
    }

    return variants[variant]
}

/**
 * Get size-specific styles
 */
function getSizeStyles(
    size: ButtonSize,
    theme: Theme
): { container: ViewStyle; text: TextStyle; iconSize: number } {
    const sizes: Record<ButtonSize, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
        sm: {
            container: {
                paddingHorizontal: theme.spacing[3],
                paddingVertical: theme.spacing[2],
                borderRadius: theme.borderRadius.md,
                gap: theme.spacing[1.5]
            },
            text: {
                fontSize: theme.fontSizes.sm,
                fontWeight: theme.fontWeights.medium
            },
            iconSize: 16
        },
        md: {
            container: {
                paddingHorizontal: theme.spacing[4],
                paddingVertical: theme.spacing[3],
                borderRadius: theme.borderRadius.lg,
                gap: theme.spacing[2]
            },
            text: {
                fontSize: theme.fontSizes.md,
                fontWeight: theme.fontWeights.semibold
            },
            iconSize: 20
        },
        lg: {
            container: {
                paddingHorizontal: theme.spacing[6],
                paddingVertical: theme.spacing[4],
                borderRadius: theme.borderRadius.xl,
                gap: theme.spacing[2.5]
            },
            text: {
                fontSize: theme.fontSizes.lg,
                fontWeight: theme.fontWeights.semibold
            },
            iconSize: 24
        }
    }

    return sizes[size]
}

/**
 * Button component with theme support
 *
 * @example
 * ```tsx
 * <Button title="Primary" variant="primary" onPress={() => {}} />
 * <Button title="Loading" loading />
 * <Button variant="ghost" leftIcon={<Ionicons name="add" />}>Add Item</Button>
 * ```
 */
export const Button = forwardRef<View, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            title,
            loading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled = false,
            style,
            textStyle,
            children,
            ...pressableProps
        },
        ref
    ) => {
        const { theme } = useTheme()
        const sizeStyles = getSizeStyles(size, theme)

        const content = title ?? children

        return (
            <Pressable
                ref={ref}
                disabled={disabled || loading}
                {...pressableProps}
                style={({ pressed }) => {
                    const variantStyles = getVariantStyles(variant, theme, pressed, disabled || loading)

                    return [
                        styles.base,
                        sizeStyles.container,
                        variantStyles.container,
                        fullWidth && styles.fullWidth,
                        style
                    ]
                }}
            >
                {({ pressed }) => {
                    const variantStyles = getVariantStyles(variant, theme, pressed, disabled || loading)
                    const textColor = variantStyles.text.color as string

                    return (
                        <>
                            {loading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={textColor}
                                    style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}
                                />
                            ) : leftIcon ? (
                                <View style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}>
                                    {leftIcon}
                                </View>
                            ) : null}

                            {typeof content === 'string' ? (
                                <Text
                                    style={[
                                        styles.text,
                                        sizeStyles.text,
                                        variantStyles.text,
                                        textStyle
                                    ]}
                                    numberOfLines={1}
                                >
                                    {content}
                                </Text>
                            ) : (
                                content
                            )}

                            {rightIcon && !loading && (
                                <View style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}>
                                    {rightIcon}
                                </View>
                            )}
                        </>
                    )
                }}
            </Pressable>
        )
    }
)

Button.displayName = 'Button'

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    fullWidth: {
        width: '100%'
    },
    text: {
        textAlign: 'center'
    }
})

