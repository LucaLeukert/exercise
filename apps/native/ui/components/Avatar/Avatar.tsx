import React from 'react'
import { Image, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Avatar sizes
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Avatar component props
 */
export interface AvatarProps {
    /** Image source URI */
    source?: string | null
    /** Fallback text (initials) */
    fallback?: string
    /** Avatar size */
    size?: AvatarSize
    /** Custom style override */
    style?: ViewStyle
    /** Custom text style override */
    textStyle?: TextStyle
}

/**
 * Avatar component for displaying user images with fallback
 *
 * @example
 * ```tsx
 * <Avatar source="https://example.com/avatar.jpg" size="lg" />
 * <Avatar fallback="JD" />
 * <Avatar source={null} fallback="AB" size="sm" />
 * ```
 */
export function Avatar({ source, fallback, size = 'md', style, textStyle }: AvatarProps) {
    const { theme } = useTheme()

    const sizeValues: Record<AvatarSize, { container: number; text: number }> = {
        xs: { container: 24, text: theme.fontSizes.xs },
        sm: { container: 32, text: theme.fontSizes.sm },
        md: { container: 48, text: theme.fontSizes.lg },
        lg: { container: 64, text: theme.fontSizes['2xl'] },
        xl: { container: 96, text: theme.fontSizes['4xl'] }
    }

    const sizeStyle = sizeValues[size]

    const containerStyle: ViewStyle = {
        width: sizeStyle.container,
        height: sizeStyle.container,
        borderRadius: sizeStyle.container / 2,
        backgroundColor: theme.colors.surfaceSecondary,
        overflow: 'hidden'
    }

    if (source) {
        return (
            <View style={[containerStyle, style]}>
                <Image source={{ uri: source }} style={styles.image} />
            </View>
        )
    }

    // Get initials from fallback
    const initials = fallback
        ? fallback
              .split(' ')
              .map((word) => word[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : ''

    return (
        <View style={[containerStyle, styles.fallbackContainer, style]}>
            <Text
                style={[
                    {
                        color: theme.colors.textSecondary,
                        fontSize: sizeStyle.text,
                        fontWeight: theme.fontWeights.semibold
                    },
                    textStyle
                ]}
            >
                {initials}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%'
    },
    fallbackContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})

