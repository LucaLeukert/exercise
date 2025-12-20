import { useEffect } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { RoutineId } from '@/utils/convex'
import { useWorkoutSession, WorkoutSet } from '@/utils/useWorkoutSession'
import { isValidConvexId } from '@/utils/workoutUtils'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@packages/backend'
import { useQuery } from 'convex/react'

export default function StartWorkoutPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const isQuickWorkout = !isValidConvexId(id)

    const routine = useQuery(
        api.routines.getById,
        isQuickWorkout ? 'skip' : { id: id as RoutineId }
    )
    const isLoading = routine === undefined && !isQuickWorkout

    const { hasActiveWorkout, startWorkout, isStarting } = useWorkoutSession()

    // Redirect to active workout if there's already an active workout
    useEffect(() => {
        if (hasActiveWorkout) {
            router.replace('/workout/active')
        }
    }, [hasActiveWorkout])

    const handleStartWorkout = async () => {
        // For routine workouts, we need the routine
        if (!isQuickWorkout && !routine) return

        const initialSets: WorkoutSet[] = []

        if (routine) {
            routine.exercises.forEach((exercise) => {
                for (let i = 0; i < exercise.sets; i++) {
                    initialSets.push({
                        exerciseId: exercise.exerciseId,
                        setNumber: i + 1,
                        targetReps: exercise.reps,
                        completedReps: 0,
                        weight: 0,
                        completed: false
                    })
                }
            })
        }
        // For quick workouts, start with empty sets - user adds exercises manually

        const routineId = isQuickWorkout ? undefined : id
        const result = await startWorkout(routineId, initialSets)

        result.match(
            () => {
                router.replace('/workout/active')
            },
            () => {
                Alert.alert('Error', 'Failed to start workout. Please try again.')
            }
        )
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        )
    }

    if (!isQuickWorkout && !routine) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Routine not found</Text>
                </View>
            </SafeAreaView>
        )
    }

    // Quick workout start screen
    if (isQuickWorkout) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Quick Workout', headerShown: true }} />
                <View style={styles.preWorkoutContainer}>
                    <Ionicons name="flash" size={80} color="#FF9500" />
                    <Text style={styles.routineTitle}>Quick Workout</Text>
                    <Text style={styles.routineDescription}>
                        Start an empty workout and add exercises as you go
                    </Text>
                    <TouchableOpacity
                        style={[styles.startButton, isStarting && styles.buttonDisabled]}
                        onPress={handleStartWorkout}
                        disabled={isStarting}
                    >
                        {isStarting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="play-circle" size={24} color="#fff" />
                                <Text style={styles.startButtonText}>Start Quick Workout</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    // Routine workout start screen
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: routine?.name ?? 'Workout', headerShown: true }} />
            <View style={styles.preWorkoutContainer}>
                <Ionicons name="fitness" size={80} color="#007AFF" />
                <Text style={styles.routineTitle}>{routine?.name}</Text>
                {routine?.description && (
                    <Text style={styles.routineDescription}>{routine.description}</Text>
                )}
                <View style={styles.workoutInfo}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Exercises</Text>
                        <Text style={styles.infoValue}>{routine?.exercises.length ?? 0}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Total Sets</Text>
                        <Text style={styles.infoValue}>
                            {routine?.exercises.reduce((sum, ex) => sum + ex.sets, 0) ?? 0}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.startButton, isStarting && styles.buttonDisabled]}
                    onPress={handleStartWorkout}
                    disabled={isStarting}
                >
                    {isStarting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="play-circle" size={24} color="#fff" />
                            <Text style={styles.startButtonText}>Start Workout</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center'
    },
    preWorkoutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    routineTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center'
    },
    routineDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32
    },
    workoutInfo: {
        flexDirection: 'row',
        gap: 40,
        marginBottom: 40
    },
    infoItem: {
        alignItems: 'center'
    },
    infoLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4
    },
    infoValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#007AFF'
    },
    startButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 8,
        minWidth: 200
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },
    buttonDisabled: {
        opacity: 0.6
    }
})
