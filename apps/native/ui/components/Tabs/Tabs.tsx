import React, { createContext, useContext, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Tabs context value
 */
interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
    const context = useContext(TabsContext)
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider')
    }
    return context
}

/**
 * Tabs root component props
 */
export interface TabsProps {
    /** Default active tab value */
    defaultValue?: string
    /** Controlled active tab value */
    value?: string
    /** Called when active tab changes */
    onValueChange?: (value: string) => void
    /** Tab children */
    children: React.ReactNode
    /** Container style override */
    style?: ViewStyle
}

/**
 * TabsList component props
 */
export interface TabsListProps {
    /** Tab trigger buttons */
    children: React.ReactNode
    /** Container style override */
    style?: ViewStyle
    /** Enable horizontal scrolling */
    scrollable?: boolean
}

/**
 * TabsTrigger component props
 */
export interface TabsTriggerProps {
    /** Tab value (matches with TabsContent) */
    value: string
    /** Trigger children/label */
    children: React.ReactNode
    /** Disabled state */
    disabled?: boolean
    /** Custom style override */
    style?: ViewStyle
    /** Custom text style override */
    textStyle?: TextStyle
}

/**
 * TabsContent component props
 */
export interface TabsContentProps {
    /** Tab value (matches with TabsTrigger) */
    value: string
    /** Content children */
    children: React.ReactNode
    /** Container style override */
    style?: ViewStyle
}

/**
 * Tabs root component
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 * ```
 */
export function Tabs({
    defaultValue = '',
    value: controlledValue,
    onValueChange,
    children,
    style
}: TabsProps) {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)

    const value = controlledValue ?? uncontrolledValue
    const handleValueChange = (newValue: string) => {
        setUncontrolledValue(newValue)
        onValueChange?.(newValue)
    }

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <View style={style}>{children}</View>
        </TabsContext.Provider>
    )
}

/**
 * Tabs list container
 */
export function TabsList({ children, style, scrollable = false }: TabsListProps) {
    const { theme } = useTheme()

    const content = (
        <View
            style={[
                styles.tabsList,
                {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing[1],
                    gap: theme.spacing[1]
                },
                style
            ]}
        >
            {children}
        </View>
    )

    if (scrollable) {
        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {content}
            </ScrollView>
        )
    }

    return content
}

/**
 * Tab trigger button
 */
export function TabsTrigger({
    value,
    children,
    disabled = false,
    style,
    textStyle
}: TabsTriggerProps) {
    const { theme } = useTheme()
    const { value: activeValue, onValueChange } = useTabsContext()

    const isActive = value === activeValue

    return (
        <Pressable
            onPress={() => !disabled && onValueChange(value)}
            style={[
                styles.tabsTrigger,
                {
                    backgroundColor: isActive ? theme.colors.surface : 'transparent',
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[2],
                    opacity: disabled ? 0.5 : 1
                },
                isActive && theme.shadows.sm,
                style
            ]}
        >
            <Text
                style={[
                    {
                        color: isActive ? theme.colors.text : theme.colors.textSecondary,
                        fontSize: theme.fontSizes.sm,
                        fontWeight: isActive ? theme.fontWeights.semibold : theme.fontWeights.normal
                    },
                    textStyle
                ]}
            >
                {children}
            </Text>
        </Pressable>
    )
}

/**
 * Tab content panel
 */
export function TabsContent({ value, children, style }: TabsContentProps) {
    const { value: activeValue } = useTabsContext()

    if (value !== activeValue) {
        return null
    }

    return <View style={style}>{children}</View>
}

const styles = StyleSheet.create({
    tabsList: {
        flexDirection: 'row'
    },
    tabsTrigger: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
