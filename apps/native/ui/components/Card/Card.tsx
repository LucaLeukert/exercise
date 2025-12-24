import React from 'react'
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'
import { ShadowKey } from '../../theme/shadows'

/**
 * Card elevation levels
 */
export type CardElevation = 'none' | 'sm' | 'md' | 'lg'

/**
 * Card component props
 */
export interface CardProps {
    /** Card content */
    children: React.ReactNode
    /** Elevation/shadow level */
    elevation?: CardElevation
    /** Custom style override */
    style?: ViewStyle
    /** Padding preset */
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * CardHeader component props
 */
export interface CardHeaderProps {
    /** Header content */
    children: React.ReactNode
    /** Custom style override */
    style?: ViewStyle
}

/**
 * CardTitle component props
 */
export interface CardTitleProps {
    /** Title text */
    children: React.ReactNode
    /** Custom style override */
    style?: TextStyle
}

/**
 * CardDescription component props
 */
export interface CardDescriptionProps {
    /** Description text */
    children: React.ReactNode
    /** Custom style override */
    style?: TextStyle
}

/**
 * CardContent component props
 */
export interface CardContentProps {
    /** Content */
    children: React.ReactNode
    /** Custom style override */
    style?: ViewStyle
}

/**
 * CardFooter component props
 */
export interface CardFooterProps {
    /** Footer content */
    children: React.ReactNode
    /** Custom style override */
    style?: ViewStyle
}

/**
 * Card container component
 *
 * @example
 * ```tsx
 * <Card elevation="md">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <Text>Content goes here</Text>
 *   </CardContent>
 *   <CardFooter>
 *     <Button title="Action" />
 *   </CardFooter>
 * </Card>
 * ```
 */
export function Card({ children, elevation = 'md', style, padding = 'md' }: CardProps) {
    const { theme } = useTheme()

    const elevationToShadow: Record<CardElevation, ShadowKey> = {
        none: 'none',
        sm: 'sm',
        md: 'md',
        lg: 'lg'
    }

    const paddingValues: Record<string, number> = {
        none: 0,
        sm: theme.spacing[3],
        md: theme.spacing[4],
        lg: theme.spacing[6]
    }

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.xl,
                    padding: paddingValues[padding]
                },
                theme.shadows[elevationToShadow[elevation]],
                style
            ]}
        >
            {children}
        </View>
    )
}

/**
 * Card header section
 */
export function CardHeader({ children, style }: CardHeaderProps) {
    const { theme } = useTheme()

    return (
        <View style={[styles.header, { marginBottom: theme.spacing[3] }, style]}>{children}</View>
    )
}

/**
 * Card title text
 */
export function CardTitle({ children, style }: CardTitleProps) {
    const { theme } = useTheme()

    return (
        <Text
            style={[
                {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.xl,
                    fontWeight: theme.fontWeights.bold
                },
                style
            ]}
        >
            {children}
        </Text>
    )
}

/**
 * Card description text
 */
export function CardDescription({ children, style }: CardDescriptionProps) {
    const { theme } = useTheme()

    return (
        <Text
            style={[
                {
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.sm,
                    marginTop: theme.spacing[1]
                },
                style
            ]}
        >
            {children}
        </Text>
    )
}

/**
 * Card content section
 */
export function CardContent({ children, style }: CardContentProps) {
    return <View style={[styles.content, style]}>{children}</View>
}

/**
 * Card footer section
 */
export function CardFooter({ children, style }: CardFooterProps) {
    const { theme } = useTheme()

    return (
        <View
            style={[
                styles.footer,
                {
                    marginTop: theme.spacing[4],
                    paddingTop: theme.spacing[4],
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border
                },
                style
            ]}
        >
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden'
    },
    header: {},
    content: {},
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8
    }
})
