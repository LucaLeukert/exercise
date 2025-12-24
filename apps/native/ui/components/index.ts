/**
 * UI Component Library
 *
 * All themed components are exported here for easy imports.
 *
 * @example
 * ```tsx
 * import { Button, Card, Input, Badge } from '@/ui/components'
 * ```
 */

// Button
export { Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'

// Input
export { Input } from './Input'
export type { InputProps, InputSize } from './Input'

// Card
export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from './Card'
export type {
    CardProps,
    CardElevation,
    CardHeaderProps,
    CardTitleProps,
    CardDescriptionProps,
    CardContentProps,
    CardFooterProps
} from './Card'

// Badge
export { Badge } from './Badge'
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge'

// Separator
export { Separator } from './Separator'
export type { SeparatorProps, SeparatorOrientation } from './Separator'

// Avatar
export { Avatar } from './Avatar'
export type { AvatarProps, AvatarSize } from './Avatar'

// Dialog
export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from './Dialog'
export type {
    DialogProps,
    DialogContentProps,
    DialogHeaderProps,
    DialogTitleProps,
    DialogDescriptionProps,
    DialogFooterProps,
    DialogCloseProps
} from './Dialog'

// Progress
export { Progress } from './Progress'
export type { ProgressProps, ProgressSize } from './Progress'

// Select
export { Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './Tabs'

// Checkbox
export { Checkbox } from './Checkbox'
export type { CheckboxProps, CheckboxSize } from './Checkbox'

// Switch
export { Switch } from './Switch'
export type { SwitchProps, SwitchSize } from './Switch'

// Alert
export { Alert } from './Alert'
export type { AlertProps, AlertVariant } from './Alert'

