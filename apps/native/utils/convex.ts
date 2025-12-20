/**
 * Convex Client Hooks
 *
 * This file provides typed hooks for interacting with Convex functions.
 * It replaces the previous tRPC API calls.
 *
 * Migration mapping:
 * - api.exercise.* -> useQuery(api.exercises.*)
 * - api.routine.* -> useQuery/useMutation(api.routines.*)
 * - api.workout.* -> useQuery/useMutation(api.workouts.*)
 */

import { useMutation, useQuery } from 'convex/react'

import type { Id } from '@packages/backend/convex/_generated/dataModel'
import { api } from '@packages/backend/convex/_generated/api'

// Re-export the api for direct access
export { api }

// Type exports for convenience
export type RoutineId = Id<'routines'>
export type WorkoutId = Id<'workoutSessions'>
export type ExerciseDoc =
    typeof api.exercises.getById._returnType extends Promise<infer T>
        ? T extends { exercise: infer E }
            ? E
            : never
        : never

// ============================================
// Exercise Hooks (replaces api.exercise.*)
// ============================================

export function useExercisesByIds(ids: string[]) {
    return useQuery(api.exercises.getByIds, { ids })
}

export function useExercise(id: string) {
    return useQuery(api.exercises.getById, { id })
}

export function useExerciseVersion() {
    return useQuery(api.exercises.version, {})
}

export function useExerciseSync() {
    return useQuery(api.exercises.sync, {})
}

export function useExerciseSearch(params: {
    searchTerm?: string
    muscle?: string
    category?: string
    equipment?: string
    level?: string
    limit?: number
}) {
    return useQuery(api.exercises.search, params)
}

// ============================================
// Routine Hooks (replaces api.routine.*)
// ============================================

export function useRoutines() {
    return useQuery(api.routines.list, {})
}

export function useRoutine(id: RoutineId | undefined) {
    return useQuery(api.routines.getById, id ? { id } : 'skip')
}

export function useCreateRoutine() {
    return useMutation(api.routines.create)
}

export function useUpdateRoutine() {
    return useMutation(api.routines.update)
}

export function useDeleteRoutine() {
    return useMutation(api.routines.remove)
}

// ============================================
// Workout Hooks (replaces api.workout.*)
// ============================================

export function useStartWorkout() {
    return useMutation(api.workouts.start)
}

export function useSaveWorkoutProgress() {
    return useMutation(api.workouts.saveProgress)
}

export function useCompleteWorkout() {
    return useMutation(api.workouts.complete)
}

export function useCancelWorkout() {
    return useMutation(api.workouts.cancel)
}

/**
 * Get a workout by ID - this is a reactive query that replaces SSE streaming.
 * The query will automatically update when the workout data changes.
 */
export function useWorkout(workoutId: WorkoutId | undefined) {
    return useQuery(api.workouts.getById, workoutId ? { workoutId } : 'skip')
}

/**
 * Get the currently active workout for the user.
 */
export function useActiveWorkout() {
    return useQuery(api.workouts.getActive, {})
}

/**
 * Get recent workouts.
 */
export function useRecentWorkouts(limit?: number) {
    return useQuery(api.workouts.recent, { limit })
}

/**
 * Get workout history with optional filters.
 */
export function useWorkoutHistory(params?: {
    status?: 'active' | 'completed' | 'cancelled' | 'archived'
    limit?: number
}) {
    return useQuery(api.workouts.history, params ?? {})
}

/**
 * Follow a public workout (replaces SSE streaming for following other users' workouts).
 * This is a reactive query that updates in real-time.
 */
export function useFollowWorkout(workoutId: WorkoutId) {
    return useQuery(api.workouts.follow, { workoutId })
}
