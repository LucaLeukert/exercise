import React from 'react'
import { View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'

/**
 * Separator orientation
 */
export type SeparatorOrientation = 'horizontal' | 'vertical'

/**
 * Separator component props
 */
export interface SeparatorProps {
    /** Separator orientation */
    orientation?: SeparatorOrientation
    /** Custom style override */
    style?: ViewStyle
    /** Spacing around the separator */
    spacing?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * Separator/Divider component
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * <Separator spacing="lg" />
 * ```
 */
export function Separator({
    orientation = 'horizontal',
    style,
    spacing = 'md'
}: SeparatorProps) {
    const { theme } = useTheme()

    const spacingValues: Record<string, number> = {
        none: 0,
        sm: theme.spacing[2],
        md: theme.spacing[4],
        lg: theme.spacing[6]
    }

    const spacingValue = spacingValues[spacing]

    const baseStyle: ViewStyle =
        orientation === 'horizontal'
            ? {
                  height: 1,
                  width: '100%',
                  backgroundColor: theme.colors.border,
                  marginVertical: spacingValue
              }
            : {
                  width: 1,
                  height: '100%',
                  backgroundColor: theme.colors.border,
                  marginHorizontal: spacingValue
              }

    return <View style={[baseStyle, style]} />
}

