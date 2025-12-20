import AsyncStorage from '@react-native-async-storage/async-storage'

import type { ExerciseType } from '@packages/backend/convex/schema'

const EXERCISE_DB_KEY = '@exercise_database'
const EXERCISE_VERSION_KEY = '@exercise_version'

export interface ExerciseDatabase {
    version: string
    timestamp: number
    exercises: ExerciseType[]
}

/**
 * Get the current version of the local exercise database
 */
export async function getLocalVersion(): Promise<string | null> {
    try {
        const version = await AsyncStorage.getItem(EXERCISE_VERSION_KEY)
        return version
    } catch (error) {
        console.error('Error getting local version:', error)
        return null
    }
}

/**
 * Get all exercises from local storage
 */
export async function getLocalExercises(): Promise<ExerciseType[] | null> {
    try {
        const data = await AsyncStorage.getItem(EXERCISE_DB_KEY)
        if (!data) return null

        const db: ExerciseDatabase = JSON.parse(data)
        return db.exercises
    } catch (error) {
        console.error('Error getting local exercises:', error)
        return null
    }
}

/**
 * Save exercises to local storage with version
 */
export async function saveExercisesToLocal(
    exercises: ExerciseType[],
    version: string
): Promise<void> {
    try {
        const db: ExerciseDatabase = {
            version,
            timestamp: Date.now(),
            exercises
        }

        await AsyncStorage.multiSet([
            [EXERCISE_DB_KEY, JSON.stringify(db)],
            [EXERCISE_VERSION_KEY, version]
        ])
    } catch (error) {
        console.error('Error saving exercises to local:', error)
        throw error
    }
}

/**
 * Clear local exercise cache
 */
export async function clearLocalExercises(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([EXERCISE_DB_KEY, EXERCISE_VERSION_KEY])
    } catch (error) {
        console.error('Error clearing local exercises:', error)
        throw error
    }
}

/**
 * Get database info (version and timestamp)
 */
export async function getLocalDatabaseInfo(): Promise<{
    version: string | null
    timestamp: number | null
    exerciseCount: number
} | null> {
    try {
        const data = await AsyncStorage.getItem(EXERCISE_DB_KEY)
        if (!data) return null

        const db: ExerciseDatabase = JSON.parse(data)
        return {
            version: db.version,
            timestamp: db.timestamp,
            exerciseCount: db.exercises.length
        }
    } catch (error) {
        console.error('Error getting database info:', error)
        return null
    }
}
