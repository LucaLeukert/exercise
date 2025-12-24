import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Progress sizes
 */
export type ProgressSize = 'sm' | 'md' | 'lg'

/**
 * Progress component props
 */
export interface ProgressProps {
    /** Progress value (0-100) */
    value: number
    /** Maximum value (default: 100) */
    max?: number
    /** Progress size */
    size?: ProgressSize
    /** Custom style override */
    style?: ViewStyle
    /** Show indeterminate animation */
    indeterminate?: boolean
}

/**
 * Progress bar component
 *
 * @example
 * ```tsx
 * <Progress value={75} />
 * <Progress value={50} size="lg" />
 * ```
 */
export function Progress({
    value,
    max = 100,
    size = 'md',
    style,
    indeterminate = false
}: ProgressProps) {
    const { theme } = useTheme()
    const animatedValue = useRef(new Animated.Value(0)).current

    const heightValues: Record<ProgressSize, number> = {
        sm: 4,
        md: 8,
        lg: 12
    }

    const height = heightValues[size]
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    useEffect(() => {
        if (indeterminate) {
            // Create a looping animation that translates the progress bar
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
            return () => animation.stop()
        } else {
            animatedValue.setValue(0)
        }
    }, [indeterminate, animatedValue])

    const translateX = indeterminate
        ? animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['-100%', '200%']
          })
        : 0

    return (
        <View
            style={[
                styles.container,
                {
                    height,
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderRadius: height / 2,
                    overflow: 'hidden'
                },
                style
            ]}
        >
            {indeterminate ? (
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            width: '50%',
                            height: '100%',
                            backgroundColor: theme.colors.primary,
                            borderRadius: height / 2,
                            transform: [{ translateX }]
                        }
                    ]}
                />
            ) : (
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: theme.colors.primary,
                            borderRadius: height / 2
                        }
                    ]}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden'
    },
    fill: {}
})
