import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { RoutineId } from '@/utils/convex'
import { useWorkoutSession, WorkoutSet } from '@/utils/useWorkoutSession'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@packages/backend'
import * as TogglePrimitive from '@rn-primitives/toggle'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from 'convex/react'

const isValidConvexId = (id: string): boolean => {
    if (!id) return false
    // UUIDs have the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return !uuidPattern.test(id)
}

export default function WorkoutPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const isQuickWorkout = !isValidConvexId(id)

    const routine = useQuery(
        api.routines.getById,
        isQuickWorkout ? 'skip' : { id: id as RoutineId }
    )
    const isLoading = routine === undefined && !isQuickWorkout

    const {
        activeSession,
        sets,
        isSyncing,
        syncError,
        hasActiveWorkout,
        startWorkout,
        updateSet,
        completeWorkout,
        cancelWorkout,
        isStarting,
        isCompleting
    } = useWorkoutSession()

    const [workoutStarted, setWorkoutStarted] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)

    // Get exercise IDs from routine or from active session sets
    const exerciseIds = useMemo(() => {
        if (routine) {
            return routine.exercises.map((ex) => ex.exerciseId)
        }
        if (sets.length > 0) {
            return [...new Set(sets.map((s) => s.exerciseId))]
        }
        return []
    }, [routine, sets])

    const exercisesData = useQuery(api.exercises.getByIds, { ids: exerciseIds })

    const allExercises = exercisesData?.exercises ?? []

    // Check if there's an active session for this routine or quick workout
    useEffect(() => {
        if (hasActiveWorkout) {
            const matchesRoutine = !isQuickWorkout && activeSession?.routineId === id
            const matchesQuickWorkout = isQuickWorkout && !activeSession?.routineId
            if (matchesRoutine || matchesQuickWorkout) {
                setWorkoutStarted(true)
            }
        }
    }, [hasActiveWorkout, activeSession?.routineId, id, isQuickWorkout])

    // Timer for elapsed time
    useEffect(() => {
        if (!workoutStarted || !activeSession) return

        const interval = setInterval(() => {
            setElapsedTime(Date.now() - activeSession.startedAt)
        }, 1000)

        return () => clearInterval(interval)
    }, [workoutStarted, activeSession])

    const formatTime = useCallback((ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        if (hours > 0) {
            return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
        }
        return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
    }, [])

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

        try {
            const routineId = isQuickWorkout ? undefined : id
            await startWorkout(routineId, initialSets)
            setWorkoutStarted(true)
        } catch {
            Alert.alert('Error', 'Failed to start workout. Please try again.')
        }
    }

    const handleUpdateSet = (index: number, field: keyof WorkoutSet, value: number | boolean) => {
        void updateSet(index, { [field]: value })
    }

    const handleCompleteWorkout = () => {
        const completedSets = sets.filter((s) => s.completed).length

        if (completedSets === 0) {
            Alert.alert(
                'No Sets Completed',
                "You haven't completed any sets yet. Are you sure you want to finish?",
                [
                    { text: 'Continue Workout', style: 'cancel' },
                    {
                        text: 'Finish Anyway',
                        style: 'destructive',
                        onPress: () => void finishWorkout()
                    }
                ]
            )
            return
        }

        void finishWorkout()
    }

    const finishWorkout = async () => {
        try {
            await completeWorkout()
            router.back()
        } catch {
            Alert.alert('Error', 'Failed to complete workout. Please try again.')
        }
    }

    const handleCancelWorkout = () => {
        Alert.alert(
            'Cancel Workout',
            'Are you sure you want to cancel this workout? All progress will be lost.',
            [
                { text: 'Continue Workout', style: 'cancel' },
                {
                    text: 'Cancel Workout',
                    style: 'destructive',
                    onPress: async () => {
                        await cancelWorkout()
                        router.back()
                    }
                }
            ]
        )
    }

    // Progress stats
    const stats = useMemo(() => {
        const totalSets = sets.length
        const completedSets = sets.filter((s) => s.completed).length
        const totalWeight = sets.reduce(
            (sum, s) => sum + (s.completed ? s.weight * s.completedReps : 0),
            0
        )

        return { totalSets, completedSets, totalWeight }
    }, [sets])

    if (!isQuickWorkout && isLoading) {
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

    if (!workoutStarted) {
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

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Workout in Progress',
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleCancelWorkout} style={styles.headerButton}>
                            <Text style={styles.headerButtonCancel}>Cancel</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#666" />
                    <Text style={styles.statValue}>
                        {stats.completedSets}/{stats.totalSets}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="barbell-outline" size={18} color="#666" />
                    <Text style={styles.statValue}>{stats.totalWeight} kg</Text>
                </View>
                <View style={styles.syncIndicator}>
                    {isSyncing ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : syncError ? (
                        <Ionicons name="cloud-offline" size={18} color="#FF3B30" />
                    ) : (
                        <Ionicons name="cloud-done" size={18} color="#34C759" />
                    )}
                </View>
            </View>

            <FlashList
                data={sets}
                renderItem={({ item, index }) => {
                    const exercise = allExercises.find((ex) => ex.externalId === item.exerciseId)
                    const exerciseSets = sets.filter((s) => s.exerciseId === item.exerciseId)
                    const isFirstSet = exerciseSets[0] === item

                    return (
                        <View style={styles.setContainer}>
                            {isFirstSet && (
                                <View style={styles.exerciseHeader}>
                                    <Text style={styles.exerciseName}>{exercise?.name}</Text>
                                    <Text style={styles.exerciseMeta}>
                                        {exerciseSets.length} sets × {item.targetReps} reps
                                    </Text>
                                </View>
                            )}

                            <View style={[styles.setRow, item.completed && styles.setRowCompleted]}>
                                <View style={styles.setNumber}>
                                    <Text style={styles.setNumberText}>{item.setNumber}</Text>
                                </View>

                                <View style={styles.setInputs}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Weight</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={String(item.weight)}
                                            onChangeText={(val) =>
                                                handleUpdateSet(index, 'weight', parseInt(val) || 0)
                                            }
                                            keyboardType="numeric"
                                            placeholder="0"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Reps</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={String(item.completedReps)}
                                            onChangeText={(val) =>
                                                handleUpdateSet(
                                                    index,
                                                    'completedReps',
                                                    parseInt(val) || 0
                                                )
                                            }
                                            keyboardType="numeric"
                                            placeholder={String(item.targetReps)}
                                        />
                                    </View>
                                </View>

                                <TogglePrimitive.Root
                                    style={({ pressed }) => [
                                        styles.checkButton,
                                        item.completed && styles.checkButtonCompleted,
                                        pressed && { opacity: 0.7 }
                                    ]}
                                    pressed={item.completed}
                                    onPressedChange={() =>
                                        handleUpdateSet(index, 'completed', !item.completed)
                                    }
                                >
                                    <Ionicons
                                        name={item.completed ? 'checkmark' : 'checkmark-outline'}
                                        size={24}
                                        color={item.completed ? '#fff' : '#007AFF'}
                                    />
                                </TogglePrimitive.Root>
                            </View>
                        </View>
                    )
                }}
                keyExtractor={(item, index) => `${item.exerciseId}-${index}`}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.completeButton, isCompleting && styles.buttonDisabled]}
                    onPress={handleCompleteWorkout}
                    disabled={isCompleting}
                >
                    {isCompleting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.completeButtonText}>Complete Workout</Text>
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
    },
    headerButton: {
        padding: 8
    },
    headerButtonCancel: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600'
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 16,
        alignItems: 'center'
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333'
    },
    syncIndicator: {
        marginLeft: 'auto'
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 16
    },
    setContainer: {
        marginBottom: 16
    },
    exerciseHeader: {
        marginBottom: 12
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4
    },
    exerciseMeta: {
        fontSize: 14,
        color: '#666'
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    setRowCompleted: {
        backgroundColor: '#f0fff4',
        borderWidth: 1,
        borderColor: '#34C759'
    },
    setNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    setNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666'
    },
    setInputs: {
        flex: 1,
        flexDirection: 'row',
        gap: 12
    },
    inputGroup: {
        flex: 1
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        backgroundColor: '#f5f5f5',
        textAlign: 'center'
    },
    checkButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12
    },
    checkButtonCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50'
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 52
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    }
})
