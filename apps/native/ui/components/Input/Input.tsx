import React, { forwardRef, useState } from 'react'
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle
} from 'react-native'

import { useTheme } from '../../hooks/useTheme'
import { Theme } from '../../theme/themes'

/**
 * Input sizes
 */
export type InputSize = 'sm' | 'md' | 'lg'

/**
 * Input component props
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
    /** Input label */
    label?: string
    /** Error message */
    error?: string
    /** Helper text */
    helperText?: string
    /** Input size */
    size?: InputSize
    /** Left icon element */
    leftIcon?: React.ReactNode
    /** Right icon element */
    rightIcon?: React.ReactNode
    /** Container style override */
    containerStyle?: ViewStyle
    /** Input style override */
    style?: TextStyle
    /** Disabled state */
    disabled?: boolean
}

/**
 * Get size-specific styles
 */
function getSizeStyles(
    size: InputSize,
    theme: Theme
): { container: ViewStyle; input: TextStyle; iconSize: number } {
    const sizes: Record<InputSize, { container: ViewStyle; input: TextStyle; iconSize: number }> = {
        sm: {
            container: {
                paddingHorizontal: theme.spacing[3],
                paddingVertical: theme.spacing[2],
                borderRadius: theme.borderRadius.md,
                gap: theme.spacing[2]
            },
            input: {
                fontSize: theme.fontSizes.sm
            },
            iconSize: 16
        },
        md: {
            container: {
                paddingHorizontal: theme.spacing[4],
                paddingVertical: theme.spacing[3],
                borderRadius: theme.borderRadius.lg,
                gap: theme.spacing[2.5]
            },
            input: {
                fontSize: theme.fontSizes.md
            },
            iconSize: 20
        },
        lg: {
            container: {
                paddingHorizontal: theme.spacing[4],
                paddingVertical: theme.spacing[4],
                borderRadius: theme.borderRadius.xl,
                gap: theme.spacing[3]
            },
            input: {
                fontSize: theme.fontSizes.lg
            },
            iconSize: 24
        }
    }

    return sizes[size]
}

/**
 * Input component with theme support
 *
 * @example
 * ```tsx
 * <Input label="Email" placeholder="Enter email" />
 * <Input label="Password" error="Password is required" secureTextEntry />
 * <Input leftIcon={<Ionicons name="search" />} placeholder="Search..." />
 * ```
 */
export const Input = forwardRef<TextInput, InputProps>(
    (
        {
            label,
            error,
            helperText,
            size = 'md',
            leftIcon,
            rightIcon,
            containerStyle,
            style,
            disabled = false,
            onFocus,
            onBlur,
            ...textInputProps
        },
        ref
    ) => {
        const { theme } = useTheme()
        const [isFocused, setIsFocused] = useState(false)
        const sizeStyles = getSizeStyles(size, theme)

        const hasError = Boolean(error)

        const handleFocus = (e: any) => {
            setIsFocused(true)
            onFocus?.(e)
        }

        const handleBlur = (e: any) => {
            setIsFocused(false)
            onBlur?.(e)
        }

        const getBorderColor = () => {
            if (hasError) return theme.colors.error
            if (isFocused) return theme.colors.primary
            return theme.colors.border
        }

        return (
            <View style={containerStyle}>
                {label && (
                    <Text
                        style={[
                            styles.label,
                            {
                                color: hasError ? theme.colors.error : theme.colors.textSecondary,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.medium,
                                marginBottom: theme.spacing[2]
                            }
                        ]}
                    >
                        {label}
                    </Text>
                )}

                <View
                    style={[
                        styles.inputContainer,
                        sizeStyles.container,
                        {
                            backgroundColor: disabled
                                ? theme.colors.surfaceSecondary
                                : theme.colors.surface,
                            borderWidth: 1,
                            borderColor: getBorderColor()
                        }
                    ]}
                >
                    {leftIcon && (
                        <View
                            style={{
                                width: sizeStyles.iconSize,
                                height: sizeStyles.iconSize,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {leftIcon}
                        </View>
                    )}

                    <TextInput
                        ref={ref}
                        editable={!disabled}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholderTextColor={theme.colors.textMuted}
                        {...textInputProps}
                        style={[
                            styles.input,
                            sizeStyles.input,
                            {
                                color: disabled ? theme.colors.textTertiary : theme.colors.text
                            },
                            style
                        ]}
                    />

                    {rightIcon && (
                        <View
                            style={{
                                width: sizeStyles.iconSize,
                                height: sizeStyles.iconSize,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {rightIcon}
                        </View>
                    )}
                </View>

                {(error || helperText) && (
                    <Text
                        style={[
                            styles.helperText,
                            {
                                color: hasError ? theme.colors.error : theme.colors.textTertiary,
                                fontSize: theme.fontSizes.xs,
                                marginTop: theme.spacing[1.5]
                            }
                        ]}
                    >
                        {error || helperText}
                    </Text>
                )}
            </View>
        )
    }
)

Input.displayName = 'Input'

const styles = StyleSheet.create({
    label: {},
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    input: {
        flex: 1,
        padding: 0,
        margin: 0
    },
    helperText: {}
})

