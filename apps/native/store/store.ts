import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

import type { ExerciseType } from '@packages/backend/convex/schema'

import { ColorTokens } from '../ui/theme/colors'
import {
    getTheme,
    getThemeNames,
    hasTheme,
    registerTheme,
    Theme,
    ThemeName
} from '../ui/theme/themes'

const THEME_STORAGE_KEY = '@app/theme'

export interface ExerciseInRoutine {
    exerciseId: string
    sets: number
    reps: number
    notes?: string
}

// ===== Routine Store =====
export interface RoutineState {
    name: string
    description: string
    exercises: ExerciseInRoutine[]
    setName: (name: string) => void
    setDescription: (description: string) => void
    addExercise: (exercise: ExerciseInRoutine) => void
    removeExercise: (exerciseId: string) => void
    updateExercise: (exerciseId: string, updates: Partial<ExerciseInRoutine>) => void
    reset: () => void
}

export const useRoutineStore = create<RoutineState>((set) => ({
    name: '',
    description: '',
    exercises: [],
    setName: (name) => set({ name }),
    setDescription: (description) => set({ description }),
    addExercise: (exercise) =>
        set((state) => ({
            exercises: [...state.exercises, exercise]
        })),
    removeExercise: (exerciseId) =>
        set((state) => ({
            exercises: state.exercises.filter((e) => e.exerciseId !== exerciseId)
        })),
    updateExercise: (exerciseId, updates) =>
        set((state) => ({
            exercises: state.exercises.map((e) =>
                e.exerciseId === exerciseId ? { ...e, ...updates } : e
            )
        })),
    reset: () => set({ name: '', description: '', exercises: [] })
}))

export interface ExerciseDatabaseState {
    isInitialized: boolean
    isSyncing: boolean
    exercises: ExerciseType[]
    version: string | null
    lastSync: number | null
    error: string | null
    setExercises: (exercises: ExerciseType[], version: string, timestamp: number) => void
    setError: (error: string | null) => void
    setSyncing: (isSyncing: boolean) => void
    setInitialized: (isInitialized: boolean) => void
    clearDatabase: () => void
}

export const useExerciseDatabaseStore = create<ExerciseDatabaseState>((set) => ({
    isInitialized: false,
    isSyncing: false,
    exercises: [],
    version: null,
    lastSync: null,
    error: null,
    setExercises: (exercises, version, timestamp) =>
        set({
            exercises,
            version,
            lastSync: timestamp,
            isInitialized: true,
            isSyncing: false,
            error: null
        }),
    setError: (error) => set({ error, isSyncing: false }),
    setSyncing: (isSyncing) => set({ isSyncing, error: null }),
    setInitialized: (isInitialized) => set({ isInitialized }),
    clearDatabase: () =>
        set({
            isInitialized: false,
            isSyncing: false,
            exercises: [],
            version: null,
            lastSync: null,
            error: null
        })
}))

// ===== Theme Store =====
export interface ThemeState {
    themeName: ThemeName
    followSystem: boolean
    isLoaded: boolean
    theme: Theme
    isDark: boolean
    availableThemes: string[]
    systemColorScheme: 'light' | 'dark' | null
    setTheme: (name: ThemeName) => Promise<void>
    toggleTheme: () => Promise<void>
    setFollowSystem: (follow: boolean) => Promise<void>
    registerCustomTheme: (name: string, theme: Partial<Theme> & { colors: ColorTokens }) => void
    initializeTheme: (defaultTheme?: string, defaultFollowSystem?: boolean) => Promise<void>
    updateSystemColorScheme: (scheme: 'light' | 'dark' | null) => void
}

export const useThemeStore = create<ThemeState>((set, get) => {
    // Initialize with default values
    const defaultThemeName: ThemeName = 'light'
    const defaultTheme = getTheme(defaultThemeName)

    return {
        themeName: defaultThemeName,
        followSystem: true,
        isLoaded: false,
        theme: defaultTheme,
        isDark: defaultTheme.isDark,
        availableThemes: getThemeNames(),
        systemColorScheme: null,

        setTheme: async (name: ThemeName) => {
            if (!hasTheme(name)) {
                console.warn(`Theme "${name}" not found. Available themes:`, getThemeNames())
                return
            }

            const theme = getTheme(name)
            const currentState = get()

            // If manually setting a theme, disable followSystem
            const newFollowSystem = currentState.followSystem ? false : currentState.followSystem

            set({
                themeName: name,
                theme,
                isDark: theme.isDark,
                followSystem: newFollowSystem
            })

            // Persist to storage
            try {
                await AsyncStorage.setItem(
                    THEME_STORAGE_KEY,
                    JSON.stringify({ theme: name, followSystem: newFollowSystem })
                )
            } catch (error) {
                console.warn('Failed to persist theme preference:', error)
            }
        },

        toggleTheme: async () => {
            const { theme, followSystem } = get()
            const newTheme = theme.isDark ? 'light' : 'dark'
            await get().setTheme(newTheme)

            if (followSystem) {
                set({ followSystem: false })
                try {
                    await AsyncStorage.setItem(
                        THEME_STORAGE_KEY,
                        JSON.stringify({ theme: newTheme, followSystem: false })
                    )
                } catch (error) {
                    console.warn('Failed to persist theme preference:', error)
                }
            }
        },

        setFollowSystem: async (follow: boolean) => {
            const { themeName } = get()
            set({ followSystem: follow })

            try {
                await AsyncStorage.setItem(
                    THEME_STORAGE_KEY,
                    JSON.stringify({ theme: themeName, followSystem: follow })
                )
            } catch (error) {
                console.warn('Failed to persist theme preference:', error)
            }
        },

        registerCustomTheme: (
            name: string,
            themeConfig: Partial<Theme> & { colors: ColorTokens }
        ) => {
            registerTheme(name, themeConfig)
            set({ availableThemes: getThemeNames() })
        },

        initializeTheme: async (
            defaultTheme?: string,
            defaultFollowSystem?: boolean
        ) => {
            try {
                const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY)
                let themeName: ThemeName = defaultTheme && hasTheme(defaultTheme as ThemeName)
                    ? (defaultTheme as ThemeName)
                    : defaultThemeName
                let followSystem =
                    defaultFollowSystem !== undefined ? defaultFollowSystem : true

                if (stored) {
                    const parsed = JSON.parse(stored)
                    if (hasTheme(parsed.theme)) {
                        themeName = parsed.theme
                    }
                    if (typeof parsed.followSystem === 'boolean') {
                        followSystem = parsed.followSystem
                    }
                }

                // Get system color scheme
                // Note: We'll update this from the component since useColorScheme is a hook
                const theme = getTheme(themeName)

                set({
                    themeName,
                    followSystem,
                    theme,
                    isDark: theme.isDark,
                    isLoaded: true
                })
            } catch (error) {
                console.warn('Failed to load theme preference:', error)
                set({ isLoaded: true })
            }
        },

        updateSystemColorScheme: (scheme: 'light' | 'dark' | null) => {
            const { followSystem, themeName } = get()

            if (followSystem && scheme) {
                // If following system, update theme to match
                const theme = getTheme(scheme)
                set({
                    systemColorScheme: scheme,
                    theme,
                    isDark: theme.isDark,
                    themeName: scheme
                })
            } else {
                // Just update the system color scheme without changing theme
                set({ systemColorScheme: scheme })
            }
        }
    }
})
