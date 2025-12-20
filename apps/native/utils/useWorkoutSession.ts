import { useCallback, useMemo, useState } from 'react'
import { RoutineId } from '@/utils/convex'
import { api } from '@packages/backend'
import { useMutation, useQuery } from 'convex/react'

import type { WorkoutProgress } from '@packages/backend'

export interface WorkoutSet {
    exerciseId: string
    setNumber: number
    targetReps: number
    completedReps: number
    weight: number
    completed: boolean
}

export function useWorkoutSession() {
    const [isStarting, setIsStarting] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)

    const startMutation = useMutation(api.workouts.start)
    const saveMutation = useMutation(api.workouts.saveProgress)
    const completeMutation = useMutation(api.workouts.complete)
    const cancelMutation = useMutation(api.workouts.cancel)

    const activeWorkout = useQuery(api.workouts.getActive)

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
                    routineId: routineId as RoutineId | undefined,
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

    const cancelWorkout = useCallback(async () => {
        if (!activeWorkout) return

        await cancelMutation({
            workoutId: activeWorkout._id
        })
    }, [activeWorkout, cancelMutation])

    return {
        activeSession,
        sets,
        notes,
        hasActiveWorkout,

        startWorkout,
        updateSet,
        setNotes,
        completeWorkout,
        cancelWorkout,

        isStarting,
        isCompleting,

        isSyncing: false,
        syncError: null
    }
}
