import React from 'react'
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Checkbox sizes
 */
export type CheckboxSize = 'sm' | 'md' | 'lg'

/**
 * Checkbox component props
 */
export interface CheckboxProps {
    /** Checked state */
    checked: boolean
    /** Called when checked state changes */
    onCheckedChange: (checked: boolean) => void
    /** Checkbox label */
    label?: string
    /** Checkbox size */
    size?: CheckboxSize
    /** Disabled state */
    disabled?: boolean
    /** Container style override */
    style?: ViewStyle
    /** Label style override */
    labelStyle?: TextStyle
}

/**
 * Checkbox component
 *
 * @example
 * ```tsx
 * <Checkbox
 *   checked={isChecked}
 *   onCheckedChange={setIsChecked}
 *   label="I agree to terms"
 * />
 * ```
 */
export function Checkbox({
    checked,
    onCheckedChange,
    label,
    size = 'md',
    disabled = false,
    style,
    labelStyle
}: CheckboxProps) {
    const { theme } = useTheme()

    const sizeValues: Record<CheckboxSize, { box: number; icon: number; fontSize: number }> = {
        sm: { box: 16, icon: 10, fontSize: theme.fontSizes.sm },
        md: { box: 20, icon: 12, fontSize: theme.fontSizes.md },
        lg: { box: 24, icon: 14, fontSize: theme.fontSizes.lg }
    }

    const sizeStyle = sizeValues[size]

    return (
        <Pressable
            onPress={() => !disabled && onCheckedChange(!checked)}
            style={[styles.container, { opacity: disabled ? 0.5 : 1 }, style]}
        >
            <View
                style={[
                    styles.checkbox,
                    {
                        width: sizeStyle.box,
                        height: sizeStyle.box,
                        borderRadius: theme.borderRadius.sm,
                        borderWidth: 2,
                        borderColor: checked ? theme.colors.primary : theme.colors.border,
                        backgroundColor: checked ? theme.colors.primary : 'transparent'
                    }
                ]}
            >
                {checked && (
                    <Text
                        style={{
                            color: theme.colors.primaryForeground,
                            fontSize: sizeStyle.icon,
                            fontWeight: theme.fontWeights.bold
                        }}
                    >
                        ✓
                    </Text>
                )}
            </View>

            {label && (
                <Text
                    style={[
                        {
                            color: theme.colors.text,
                            fontSize: sizeStyle.fontSize,
                            marginLeft: theme.spacing[2]
                        },
                        labelStyle
                    ]}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkbox: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})
