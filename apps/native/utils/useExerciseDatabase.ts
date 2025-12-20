import { useCallback, useEffect, useMemo } from 'react'
import { useExerciseDatabaseStore } from '@/store/store'
import { api } from '@packages/backend/convex/_generated/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from 'convex/react'

import {
    getLocalDatabaseInfo,
    getLocalExercises,
    getLocalVersion,
    saveExercisesToLocal
} from './exerciseCache'
import { unwrapOr } from './result'

/**
 * Hook to manage exercise database with local caching and automatic sync
 *
 * Migrated from tRPC to Convex
 */
export function useExerciseDatabase() {
    const state = useExerciseDatabaseStore()
    const { setExercises, setError, setSyncing, clearDatabase: clearStore } = state

    // Query for remote version - Convex subscription
    const remoteVersion = useQuery(api.exercises.version, state.isInitialized ? {} : 'skip')

    // Query for full sync data
    const syncData = useQuery(api.exercises.sync, {})

    // Convert Convex exercises to ExerciseType format
    const convertedExercises = useMemo(() => {
        if (!syncData?.exercises) return null
        return syncData.exercises
    }, [syncData])

    /**
     * Perform full sync from server
     */
    const performSync = useCallback(async () => {
        setSyncing(true)

        try {
            if (!syncData || !convertedExercises) {
                setError('No data received from sync')
                return
            }

            const saveResult = await saveExercisesToLocal(convertedExercises, syncData.version)

            saveResult.match(
                () => {
                    // Update store
                    setExercises(convertedExercises, syncData.version, syncData.timestamp)
                    console.log(
                        `Synced ${convertedExercises.length} exercises (${syncData.version})`
                    )
                },
                (error) => {
                    console.error('Error syncing exercises:', error)
                    setError('Failed to sync exercises from server')
                }
            )
        } finally {
            setSyncing(false)
        }
    }, [syncData, convertedExercises, setSyncing, setExercises, setError])

    /**
     * Clear all local exercise data
     */
    const clearDatabase = useCallback(async () => {
        // Clear local storage
        const removeResult = await Promise.all([
            AsyncStorage.removeItem('exercises'),
            AsyncStorage.removeItem('exerciseVersion'),
            AsyncStorage.removeItem('exerciseDatabaseInfo')
        ]).then(
            () => ({ type: 'success' as const }),
            (error) => ({ type: 'error' as const, error })
        )

        if (removeResult.type === 'error') {
            console.error('Error clearing exercise database:', removeResult.error)
            setError('Failed to clear exercise database')
            return
        }

        // Clear store
        clearStore()
        console.log('Exercise database cleared')
    }, [clearStore, setError])

    /**
     * Initialize: Check local storage and sync if needed
     */
    useEffect(() => {
        async function initialize() {
            // Skip if already initialized
            if (state.isInitialized) return

            setSyncing(true)

            // Check local database
            const [localInfoResult, localExercisesResult] = await Promise.all([
                getLocalDatabaseInfo(),
                getLocalExercises()
            ])

            const localInfo = unwrapOr(localInfoResult, null)
            const localExercises = unwrapOr(localExercisesResult, null)

            if (localInfo && localExercises && localExercises.length > 0) {
                // We have local data, use it immediately
                setExercises(
                    localExercises,
                    localInfo.version || 'unknown',
                    localInfo.timestamp || Date.now()
                )

                console.log(
                    `Loaded ${localExercises.length} exercises from local cache (${localInfo.version})`
                )
            } else if (syncData && convertedExercises) {
                // No local data, use Convex data
                console.log('No local exercise database found, using Convex data...')
                const saveResult = await saveExercisesToLocal(convertedExercises, syncData.version)

                saveResult.match(
                    () => {
                        setExercises(convertedExercises, syncData.version, syncData.timestamp)
                    },
                    (error) => {
                        console.error('Error saving exercises to local:', error)
                        setError('Failed to initialize exercise database')
                    }
                )
            }
        }

        initialize()
    }, [state.isInitialized, syncData, convertedExercises, setSyncing, setExercises, setError])

    /**
     * Check if we need to sync when remote version changes
     */
    useEffect(() => {
        async function checkVersion() {
            if (!remoteVersion || !state.isInitialized || state.isSyncing) return

            const localVersionResult = await getLocalVersion()
            const localVersion = unwrapOr(localVersionResult, null)

            if (localVersion !== remoteVersion.version) {
                console.log(
                    `Version mismatch: local=${localVersion}, remote=${remoteVersion.version}. Syncing...`
                )
                await performSync()
            }
        }

        checkVersion()
    }, [remoteVersion, state.isInitialized, state.isSyncing, performSync])

    /**
     * Manually trigger a sync
     */
    const forceSync = useCallback(async () => {
        await performSync()
    }, [performSync])

    return {
        isInitialized: state.isInitialized,
        isSyncing: state.isSyncing,
        exercises: state.exercises,
        version: state.version,
        lastSync: state.lastSync,
        error: state.error,
        clearDatabase,
        forceSync
    }
}
