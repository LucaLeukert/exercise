import React, { useEffect, useRef } from 'react'
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Skeleton component props
 */
export interface SkeletonProps {
    /** Width of the skeleton */
    width?: DimensionValue
    /** Height of the skeleton */
    height?: DimensionValue
    /** Border radius */
    borderRadius?: number
    /** Custom style override */
    style?: ViewStyle
    /** Whether to show circular skeleton (for avatars) */
    circle?: boolean
    /** Animation variant */
    variant?: 'pulse' | 'wave'
}

/**
 * Skeleton component for loading states
 *
 * @example
 * ```tsx
 * <Skeleton width={200} height={20} />
 * <Skeleton width={48} height={48} circle />
 * <Skeleton width="100%" height={100} borderRadius={8} />
 * ```
 */
export function Skeleton({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
    circle = false,
    variant = 'pulse'
}: SkeletonProps) {
    const { theme } = useTheme()
    const animatedValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true
                })
            ])
        )

        animation.start()

        return () => {
            animation.stop()
        }
    }, [animatedValue])

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: variant === 'pulse' ? [0.5, 1] : [0.3, 0.7]
    })

    const skeletonStyle: ViewStyle = {
        width: width,
        height: height,
        borderRadius: circle ? 9999 : borderRadius,
        backgroundColor: theme.colors.surfaceSecondary,
        ...style
    }

    return (
        <Animated.View
            style={[
                styles.skeleton,
                skeletonStyle,
                {
                    opacity
                }
            ]}
        />
    )
}

/**
 * SkeletonText component for text loading states
 */
export interface SkeletonTextProps {
    /** Number of lines */
    lines?: number
    /** Width of each line (can be array for different widths) */
    widths?: DimensionValue[]
    /** Line height */
    lineHeight?: number
    /** Spacing between lines */
    spacing?: number
    /** Custom style override */
    style?: ViewStyle
}

export function SkeletonText({
    lines = 1,
    widths = ['100%'],
    lineHeight = 16,
    spacing = 8,
    style
}: SkeletonTextProps) {
    return (
        <View style={[{ gap: spacing }, style]}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    width={widths[index] || widths[widths.length - 1] || '100%'}
                    height={lineHeight}
                    borderRadius={4}
                />
            ))}
        </View>
    )
}

/**
 * SkeletonAvatar component for avatar loading states
 */
export interface SkeletonAvatarProps {
    /** Avatar size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    /** Custom style override */
    style?: ViewStyle
}

export function SkeletonAvatar({ size = 'md', style }: SkeletonAvatarProps) {
    const sizeValues: Record<NonNullable<SkeletonAvatarProps['size']>, number> = {
        xs: 24,
        sm: 32,
        md: 48,
        lg: 64,
        xl: 96
    }

    return <Skeleton width={sizeValues[size]} height={sizeValues[size]} circle style={style} />
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden'
    }
})
