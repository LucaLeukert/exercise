import { useCallback, useEffect } from 'react'
import { useExerciseDatabaseStore } from '@/store/store'
import AsyncStorage from '@react-native-async-storage/async-storage'

import {
    getLocalDatabaseInfo,
    getLocalExercises,
    getLocalVersion,
    saveExercisesToLocal
} from './exerciseCache'
import { api } from './trpc'

/**
 * Hook to manage exercise database with local caching and automatic sync
 */
export function useExerciseDatabase() {
    const state = useExerciseDatabaseStore()
    const { setExercises, setError, setSyncing, clearDatabase: clearStore } = state

    // Query for remote version
    const { data: remoteVersion } = api.exercise.version.useQuery(undefined, {
        enabled: state.isInitialized, // Only check after initialization
        staleTime: 5 * 60 * 1000, // Keep result fresh for 5 minutes
        refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    })

    // Query for full sync (we'll manually trigger it)
    const { refetch: syncExercises } = api.exercise.sync.useQuery(undefined, {
        enabled: false // Don't run automatically
    })

    /**
     * Perform full sync from server
     */
    const performSync = useCallback(async () => {
        setSyncing(true)

        try {
            const { data } = await syncExercises()

            if (!data) {
                throw new Error('No data received from sync')
            }

            // Save to local storage
            await saveExercisesToLocal(data.exercises, data.version)

            // Update store
            setExercises(data.exercises, data.version, data.timestamp)

            console.log(`Synced ${data.exercises.length} exercises (${data.version})`)
        } catch (error) {
            console.error('Error syncing exercises:', error)
            setError('Failed to sync exercises from server')
        }
    }, [syncExercises, setSyncing, setExercises, setError])

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
                } else {
                    // No local data, fetch from server
                    console.log('No local exercise database found, syncing from server...')
                    await performSync()
                }
            } catch (error) {
                console.error('Error initializing exercise database:', error)
                setError('Failed to initialize exercise database')
            }
        }

        initialize()
    }, [state.isInitialized, performSync, setSyncing, setExercises, setError])

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
