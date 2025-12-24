/**
 * UI Library - Main exports
 *
 * This library provides a comprehensive set of themed UI components
 * built on rn-primitives with support for light, dark, and custom themes.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, Button, Card, useTheme } from '@/ui'
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <MyApp />
 *     </ThemeProvider>
 *   )
 * }
 * ```
 */

// Theme system
export * from './theme'

// Hooks
export { useTheme, createThemedStyles, useThemeColor, useThemeSpacing, useThemeShadow } from './hooks/useTheme'

// Components
export * from './components'

