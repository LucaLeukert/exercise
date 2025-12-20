import { useEffect, useMemo, useState } from 'react'
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
import { router, Stack } from 'expo-router'
import { useWorkoutSession, WorkoutSet } from '@/utils/useWorkoutSession'
import { formatTime } from '@/utils/workoutUtils'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@packages/backend'
import * as TogglePrimitive from '@rn-primitives/toggle'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from 'convex/react'

interface SetInputProps {
    set: WorkoutSet
    index: number
    onUpdate: (index: number, field: keyof WorkoutSet, value: number | boolean) => Promise<void>
}

function SetInputRow({ set, index, onUpdate }: SetInputProps) {
    const [localWeight, setLocalWeight] = useState(String(set.weight))
    const [localReps, setLocalReps] = useState(String(set.completedReps))

    // Update local state when set changes from outside
    useEffect(() => {
        setLocalWeight(String(set.weight))
        setLocalReps(String(set.completedReps))
    }, [set.weight, set.completedReps])

    const handleWeightBlur = () => {
        const parsed = parseInt(localWeight, 10)
        const value = isNaN(parsed) ? 0 : parsed
        void onUpdate(index, 'weight', value)
    }

    const handleRepsBlur = () => {
        const parsed = parseInt(localReps, 10)
        const value = isNaN(parsed) ? set.targetReps : parsed
        void onUpdate(index, 'completedReps', value)
    }

    return (
        <View style={styles.setInputs}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight</Text>
                <TextInput
                    style={styles.input}
                    value={localWeight}
                    onChangeText={setLocalWeight}
                    onBlur={handleWeightBlur}
                    onEndEditing={handleWeightBlur}
                    keyboardType="numeric"
                    placeholder="0"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                    style={styles.input}
                    value={localReps}
                    onChangeText={setLocalReps}
                    onBlur={handleRepsBlur}
                    onEndEditing={handleRepsBlur}
                    keyboardType="numeric"
                    placeholder={String(set.targetReps)}
                />
            </View>
        </View>
    )
}

export default function ActiveWorkoutPage() {
    const {
        activeSession,
        sets,
        isSyncing,
        syncError,
        updateSet,
        completeWorkout,
        cancelWorkout,
        isCompleting
    } = useWorkoutSession()

    const [elapsedTime, setElapsedTime] = useState(0)

    // Redirect if no active workout
    useEffect(() => {
        if (activeSession === null) {
            router.replace('/(home)')
        }
    }, [activeSession])

    // Get exercise IDs from active session sets
    const exerciseIds = useMemo(() => {
        if (sets.length > 0) {
            return [...new Set(sets.map((s) => s.exerciseId))]
        }
        return []
    }, [sets])

    const exercisesData = useQuery(api.exercises.getByIds, { ids: exerciseIds })
    const allExercises = exercisesData?.exercises ?? []

    // Timer for elapsed time
    useEffect(() => {
        if (!activeSession) return

        const interval = setInterval(() => {
            setElapsedTime(Date.now() - activeSession.startedAt)
        }, 1000)

        return () => clearInterval(interval)
    }, [activeSession])

    const handleUpdateSet = async (
        index: number,
        field: keyof WorkoutSet,
        value: number | boolean
    ) => {
        const result = await updateSet(index, { [field]: value })
        result.match(
            () => {
                // Success - no action needed
            },
            (error: { type: string; message: string; originalError?: unknown }) => {
                console.error('Failed to update set:', error)
            }
        )
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
        const result = await completeWorkout()

        result.match(
            () => {
                router.replace('/(home)')
            },
            () => {
                Alert.alert('Error', 'Failed to complete workout. Please try again.')
            }
        )
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
                        const result = await cancelWorkout()
                        result.match(
                            () => {
                                router.replace('/(home)')
                            },
                            (error) => {
                                console.error('Failed to cancel workout:', error)
                                Alert.alert('Error', 'Failed to cancel workout. Please try again.')
                            }
                        )
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

    if (!activeSession) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
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

                                <SetInputRow set={item} index={index} onUpdate={handleUpdateSet} />

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
    },
    buttonDisabled: {
        opacity: 0.6
    }
})
