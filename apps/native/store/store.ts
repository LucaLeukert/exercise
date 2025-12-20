import { create } from 'zustand'

import type { ExerciseType } from '@packages/backend/convex/schema'

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
