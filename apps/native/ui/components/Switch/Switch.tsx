import React from 'react'
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Switch sizes
 */
export type SwitchSize = 'sm' | 'md' | 'lg'

/**
 * Switch component props
 */
export interface SwitchProps {
    /** Checked state */
    checked: boolean
    /** Called when checked state changes */
    onCheckedChange: (checked: boolean) => void
    /** Switch label */
    label?: string
    /** Switch size */
    size?: SwitchSize
    /** Disabled state */
    disabled?: boolean
    /** Container style override */
    style?: ViewStyle
    /** Label style override */
    labelStyle?: TextStyle
}

/**
 * Switch toggle component
 *
 * @example
 * ```tsx
 * <Switch
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   label="Enable notifications"
 * />
 * ```
 */
export function Switch({
    checked,
    onCheckedChange,
    label,
    size = 'md',
    disabled = false,
    style,
    labelStyle
}: SwitchProps) {
    const { theme } = useTheme()

    const sizeValues: Record<
        SwitchSize,
        { track: { width: number; height: number }; thumb: number; fontSize: number }
    > = {
        sm: { track: { width: 36, height: 20 }, thumb: 16, fontSize: theme.fontSizes.sm },
        md: { track: { width: 48, height: 26 }, thumb: 22, fontSize: theme.fontSizes.md },
        lg: { track: { width: 60, height: 32 }, thumb: 28, fontSize: theme.fontSizes.lg }
    }

    const sizeStyle = sizeValues[size]
    const thumbOffset = checked
        ? sizeStyle.track.width - sizeStyle.thumb - 2
        : 2

    return (
        <Pressable
            onPress={() => !disabled && onCheckedChange(!checked)}
            style={[styles.container, { opacity: disabled ? 0.5 : 1 }, style]}
        >
            <View
                style={[
                    styles.track,
                    {
                        width: sizeStyle.track.width,
                        height: sizeStyle.track.height,
                        borderRadius: sizeStyle.track.height / 2,
                        backgroundColor: checked
                            ? theme.colors.primary
                            : theme.colors.surfaceSecondary
                    }
                ]}
            >
                <View
                    style={[
                        styles.thumb,
                        {
                            width: sizeStyle.thumb,
                            height: sizeStyle.thumb,
                            borderRadius: sizeStyle.thumb / 2,
                            backgroundColor: theme.colors.surface,
                            left: thumbOffset
                        },
                        theme.shadows.sm
                    ]}
                />
            </View>

            {label && (
                <Text
                    style={[
                        {
                            color: theme.colors.text,
                            fontSize: sizeStyle.fontSize,
                            marginLeft: theme.spacing[3]
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
    track: {
        justifyContent: 'center'
    },
    thumb: {
        position: 'absolute'
    }
})

