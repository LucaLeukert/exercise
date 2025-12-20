import { useCallback, useEffect, useMemo } from 'react'
import { useExerciseDatabaseStore } from '@/store/store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from 'convex/react'

import { api } from '@packages/backend/convex/_generated/api'
import {
    getLocalDatabaseInfo,
    getLocalExercises,
    getLocalVersion,
    saveExercisesToLocal
} from './exerciseCache'

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
                throw new Error('No data received from sync')
            }

            // Save to local storage (using converted format)
            await saveExercisesToLocal(convertedExercises, syncData.version)

            // Update store
            setExercises(convertedExercises, syncData.version, syncData.timestamp)

            console.log(`Synced ${convertedExercises.length} exercises (${syncData.version})`)
        } catch (error) {
            console.error('Error syncing exercises:', error)
            setError('Failed to sync exercises from server')
        }
    }, [syncData, convertedExercises, setSyncing, setExercises, setError])

    /**
     * Clear all local exercise data
     */
    const clearDatabase = useCallback(async () => {
        try {
            // Clear local storage
            await Promise.all([
                AsyncStorage.removeItem('exercises'),
                AsyncStorage.removeItem('exerciseVersion'),
                AsyncStorage.removeItem('exerciseDatabaseInfo')
            ])

            // Clear store
            clearStore()

            console.log('Exercise database cleared')
        } catch (error) {
            console.error('Error clearing exercise database:', error)
            setError('Failed to clear exercise database')
        }
    }, [clearStore, setError])

    /**
     * Initialize: Check local storage and sync if needed
     */
    useEffect(() => {
        async function initialize() {
            // Skip if already initialized
            if (state.isInitialized) return

            setSyncing(true)

            try {
                // Check local database
                const localInfo = await getLocalDatabaseInfo()
                const localExercises = await getLocalExercises()

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
                    await saveExercisesToLocal(convertedExercises, syncData.version)
                    setExercises(convertedExercises, syncData.version, syncData.timestamp)
                }
            } catch (error) {
                console.error('Error initializing exercise database:', error)
                setError('Failed to initialize exercise database')
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

            const localVersion = await getLocalVersion()

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
