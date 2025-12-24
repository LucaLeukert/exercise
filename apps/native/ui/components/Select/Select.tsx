import React, { useState } from 'react'
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Select option type
 */
export interface SelectOption {
    label: string
    value: string
}

/**
 * Select component props
 */
export interface SelectProps {
    /** Select options */
    options: SelectOption[]
    /** Selected value */
    value?: string
    /** Called when selection changes */
    onValueChange?: (value: string) => void
    /** Placeholder text */
    placeholder?: string
    /** Label text */
    label?: string
    /** Error message */
    error?: string
    /** Disabled state */
    disabled?: boolean
    /** Container style override */
    containerStyle?: ViewStyle
}

/**
 * Select dropdown component
 *
 * @example
 * ```tsx
 * <Select
 *   label="Category"
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' },
 *   ]}
 *   value={selected}
 *   onValueChange={setSelected}
 * />
 * ```
 */
export function Select({
    options,
    value,
    onValueChange,
    placeholder = 'Select...',
    label,
    error,
    disabled = false,
    containerStyle
}: SelectProps) {
    const { theme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    const selectedOption = options.find((opt) => opt.value === value)
    const hasError = Boolean(error)

    const handleSelect = (option: SelectOption) => {
        onValueChange?.(option.value)
        setIsOpen(false)
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

            <Pressable
                onPress={() => !disabled && setIsOpen(true)}
                style={[
                    styles.trigger,
                    {
                        backgroundColor: disabled
                            ? theme.colors.surfaceSecondary
                            : theme.colors.surface,
                        borderWidth: 1,
                        borderColor: hasError ? theme.colors.error : theme.colors.border,
                        borderRadius: theme.borderRadius.lg,
                        paddingHorizontal: theme.spacing[4],
                        paddingVertical: theme.spacing[3],
                        opacity: disabled ? 0.5 : 1
                    }
                ]}
            >
                <Text
                    style={{
                        color: selectedOption ? theme.colors.text : theme.colors.textMuted,
                        fontSize: theme.fontSizes.md
                    }}
                >
                    {selectedOption?.label ?? placeholder}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>▼</Text>
            </Pressable>

            {error && (
                <Text
                    style={[
                        styles.error,
                        {
                            color: theme.colors.error,
                            fontSize: theme.fontSizes.xs,
                            marginTop: theme.spacing[1.5]
                        }
                    ]}
                >
                    {error}
                </Text>
            )}

            <Modal visible={isOpen} transparent animationType="fade">
                <Pressable
                    style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
                    onPress={() => setIsOpen(false)}
                >
                    <View
                        style={[
                            styles.dropdown,
                            {
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.borderRadius.xl
                            },
                            theme.shadows.xl
                        ]}
                    >
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => handleSelect(item)}
                                    style={({ pressed }) => [
                                        styles.option,
                                        {
                                            backgroundColor: pressed
                                                ? theme.colors.surfaceSecondary
                                                : 'transparent',
                                            paddingHorizontal: theme.spacing[4],
                                            paddingVertical: theme.spacing[3]
                                        },
                                        item.value === value && {
                                            backgroundColor: theme.colors.surfaceSecondary
                                        }
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            fontSize: theme.fontSizes.md,
                                            fontWeight:
                                                item.value === value
                                                    ? theme.fontWeights.semibold
                                                    : theme.fontWeights.normal
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    label: {},
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    error: {},
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    dropdown: {
        width: '100%',
        maxWidth: 320,
        maxHeight: 300
    },
    option: {}
})

