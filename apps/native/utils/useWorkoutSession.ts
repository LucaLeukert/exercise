import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

import type { WorkoutProgress } from '@packages/backend/convex/schema'

import type { Id } from '@packages/backend/convex/_generated/dataModel'
import { api } from '@packages/backend/convex/_generated/api'

export interface WorkoutSet {
    exerciseId: string
    setNumber: number
    targetReps: number
    completedReps: number
    weight: number
    completed: boolean
}

/**
 * Hook to manage workout sessions with Convex as the single source of truth
 * No local state persistence - everything lives in Convex database
 */
export function useWorkoutSession() {
    const [isStarting, setIsStarting] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)

    // Convex mutations
    const startMutation = useMutation(api.workouts.start)
    const saveMutation = useMutation(api.workouts.saveProgress)
    const completeMutation = useMutation(api.workouts.complete)
    const cancelMutation = useMutation(api.workouts.cancel)

    // Real-time subscription to active workout - this is the single source of truth
    const activeWorkout = useQuery(api.workouts.getActive)

    // Derive all state from Convex data
    const activeSession = useMemo(() => {
        if (!activeWorkout) return null
        return {
            workoutId: activeWorkout._id,
            routineId: activeWorkout.routineId,
            status: activeWorkout.status,
            startedAt: activeWorkout.startedAt
        }
    }, [activeWorkout])

    const sets: WorkoutSet[] = useMemo(() => {
        return activeWorkout?.state?.sets ?? []
    }, [activeWorkout])

    const notes = useMemo(() => {
        return activeWorkout?.state?.notes ?? ''
    }, [activeWorkout])

    const hasActiveWorkout = activeWorkout?.status === 'active'

    // Start a new workout session
    const startWorkout = useCallback(
        async (routineId?: string, initialSets: WorkoutSet[] = []) => {
            setIsStarting(true)

            const now = Date.now()
            const initialProgress: WorkoutProgress = {
                sets: initialSets,
                startedAt: now,
                lastUpdatedAt: now
            }

            try {
                const result = await startMutation({
                    routineId: routineId as Id<'routines'> | undefined,
                    visibility: 'private',
                    initialProgress
                })

                return result
            } finally {
                setIsStarting(false)
            }
        },
        [startMutation]
    )

    // Update a set - directly saves to Convex
    const updateSet = useCallback(
        async (index: number, updates: Partial<WorkoutSet>) => {
            if (!activeWorkout || activeWorkout.status !== 'active') return

            const updatedSets = sets.map((s, i) => (i === index ? { ...s, ...updates } : s))

            const progress: WorkoutProgress = {
                sets: updatedSets,
                notes: notes || undefined,
                startedAt: activeWorkout.startedAt,
                lastUpdatedAt: Date.now()
            }

            await saveMutation({
                workoutId: activeWorkout._id,
                progress
            })
        },
        [activeWorkout, sets, notes, saveMutation]
    )

    // Update notes - directly saves to Convex
    const setNotes = useCallback(
        async (newNotes: string) => {
            if (!activeWorkout || activeWorkout.status !== 'active') return

            const progress: WorkoutProgress = {
                sets,
                notes: newNotes || undefined,
                startedAt: activeWorkout.startedAt,
                lastUpdatedAt: Date.now()
            }

            await saveMutation({
                workoutId: activeWorkout._id,
                progress
            })
        },
        [activeWorkout, sets, saveMutation]
    )

    // Complete the workout
    const completeWorkout = useCallback(async () => {
        if (!activeWorkout) return

        setIsCompleting(true)

        try {
            await completeMutation({
                workoutId: activeWorkout._id
            })
        } finally {
            setIsCompleting(false)
        }
    }, [activeWorkout, completeMutation])

    // Cancel the workout
    const cancelWorkout = useCallback(async () => {
        if (!activeWorkout) return

        await cancelMutation({
            workoutId: activeWorkout._id
        })
    }, [activeWorkout, cancelMutation])

    return {
        // Session state (from Convex)
        activeSession,
        sets,
        notes,
        hasActiveWorkout,

        // Actions
        startWorkout,
        updateSet,
        setNotes,
        completeWorkout,
        cancelWorkout,

        // Loading states
        isStarting,
        isCompleting,

        // No sync errors needed - Convex handles this automatically
        isSyncing: false,
        syncError: null
    }
}
