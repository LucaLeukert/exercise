import React from 'react'
import { Modal, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { useTheme } from '../../hooks/useTheme'
import { Button, ButtonProps } from '../Button'

/**
 * Dialog component props
 */
export interface DialogProps {
    /** Whether dialog is visible */
    open: boolean
    /** Called when dialog should close */
    onOpenChange: (open: boolean) => void
    /** Dialog content */
    children: React.ReactNode
}

/**
 * DialogContent props
 */
export interface DialogContentProps {
    /** Content children */
    children: React.ReactNode
    /** Custom style override */
    style?: ViewStyle
}

/**
 * DialogHeader props
 */
export interface DialogHeaderProps {
    /** Header children */
    children: React.ReactNode
    /** Custom style override */
    style?: ViewStyle
}

/**
 * DialogTitle props
 */
export interface DialogTitleProps {
    /** Title text */
    children: React.ReactNode
    /** Custom style override */
    style?: TextStyle
}

/**
 * DialogDescription props
 */
export interface DialogDescriptionProps {
    /** Description text */
    children: React.ReactNode
    /** Custom style override */
    style?: TextStyle
}

/**
 * DialogFooter props
 */
export interface DialogFooterProps {
    /** Footer children */
    children: React.ReactNode
    /** Custom style override */
    style?: ViewStyle
}

/**
 * DialogClose props - renders a close button
 */
export interface DialogCloseProps extends Omit<ButtonProps, 'onPress'> {
    /** Called when close is triggered */
    onClose?: () => void
}

/**
 * Dialog root component
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Confirm Action</DialogTitle>
 *       <DialogDescription>Are you sure?</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>
 *       <DialogClose variant="ghost" title="Cancel" />
 *       <Button title="Confirm" onPress={handleConfirm} />
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
    const { theme } = useTheme()

    return (
        <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={() => onOpenChange(false)}
        >
            <Pressable
                style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
                onPress={() => onOpenChange(false)}
            >
                <Pressable onPress={(e) => e.stopPropagation()}>{children}</Pressable>
            </Pressable>
        </Modal>
    )
}

/**
 * Dialog content container
 */
export function DialogContent({ children, style }: DialogContentProps) {
    const { theme } = useTheme()

    return (
        <View
            style={[
                styles.content,
                {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius['2xl'],
                    padding: theme.spacing[6]
                },
                theme.shadows.xl,
                style
            ]}
        >
            {children}
        </View>
    )
}

/**
 * Dialog header section
 */
export function DialogHeader({ children, style }: DialogHeaderProps) {
    const { theme } = useTheme()

    return <View style={[{ marginBottom: theme.spacing[4] }, style]}>{children}</View>
}

/**
 * Dialog title
 */
export function DialogTitle({ children, style }: DialogTitleProps) {
    const { theme } = useTheme()

    return (
        <Text
            style={[
                {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.xl,
                    fontWeight: theme.fontWeights.bold,
                    textAlign: 'center'
                },
                style
            ]}
        >
            {children}
        </Text>
    )
}

/**
 * Dialog description
 */
export function DialogDescription({ children, style }: DialogDescriptionProps) {
    const { theme } = useTheme()

    return (
        <Text
            style={[
                {
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.md,
                    textAlign: 'center',
                    marginTop: theme.spacing[2]
                },
                style
            ]}
        >
            {children}
        </Text>
    )
}

/**
 * Dialog footer section
 */
export function DialogFooter({ children, style }: DialogFooterProps) {
    const { theme } = useTheme()

    return (
        <View
            style={[styles.footer, { marginTop: theme.spacing[6], gap: theme.spacing[3] }, style]}
        >
            {children}
        </View>
    )
}

/**
 * Dialog close button - uses Dialog context to close
 */
export function DialogClose({ onClose, ...buttonProps }: DialogCloseProps) {
    return <Button variant="ghost" onPress={onClose} {...buttonProps} />
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    content: {
        width: '100%',
        maxWidth: 340
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center'
    }
})
