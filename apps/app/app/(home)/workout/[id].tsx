import { useState } from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { api } from '@/utils/trpc'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'

interface ExerciseSet {
    exerciseId: string
    setNumber: number
    targetReps: number
    completedReps: number
    weight: number
    completed: boolean
}

export default function WorkoutPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: routine, isLoading } = api.routine.byId.useQuery({ id })

    const [sets, setSets] = useState<ExerciseSet[]>([])
    const [workoutStarted, setWorkoutStarted] = useState(false)

    const { data: exercisesData } = api.exercise.getByIds.useQuery(
        {
            ids: routine ? routine.exercises.map((ex) => ex.exerciseId) : []
        },
        {
            enabled: !!routine
        }
    )

    const allExercises = exercisesData?.exercises ?? []

    const startWorkout = () => {
        if (!routine) return

        const initialSets: ExerciseSet[] = []
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
        setSets(initialSets)
        setWorkoutStarted(true)
    }

    const updateSet = (index: number, field: keyof ExerciseSet, value: number | boolean) => {
        const newSets = [...sets]
        newSets[index] = { ...newSets[index], [field]: value }
        setSets(newSets)
    }

    const completeWorkout = () => {
        router.back()
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

    if (!routine) {
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
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: routine.name, headerShown: true }} />
                <View style={styles.preWorkoutContainer}>
                    <Ionicons name="fitness" size={80} color="#007AFF" />
                    <Text style={styles.routineTitle}>{routine.name}</Text>
                    {routine.description && (
                        <Text style={styles.routineDescription}>{routine.description}</Text>
                    )}
                    <View style={styles.workoutInfo}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Exercises</Text>
                            <Text style={styles.infoValue}>{routine.exercises.length}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Total Sets</Text>
                            <Text style={styles.infoValue}>
                                {routine.exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
                        <Ionicons name="play-circle" size={24} color="#fff" />
                        <Text style={styles.startButtonText}>Start Workout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{ title: 'Workout in Progress', headerShown: true }} />

            <FlashList
                data={sets}
                renderItem={({ item, index }) => {
                    const exercise = allExercises.find((ex) => ex.id === item.exerciseId)
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

                            <View style={styles.setRow}>
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
                                                updateSet(index, 'weight', parseInt(val) || 0)
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
                                                updateSet(
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

                                <TouchableOpacity
                                    style={[
                                        styles.checkButton,
                                        item.completed && styles.checkButtonCompleted
                                    ]}
                                    onPress={() => updateSet(index, 'completed', !item.completed)}
                                >
                                    <Ionicons
                                        name={item.completed ? 'checkmark' : 'checkmark-outline'}
                                        size={24}
                                        color={item.completed ? '#fff' : '#007AFF'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }}
                keyExtractor={(item, index) => `${item.exerciseId}-${index}`}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.completeButton} onPress={completeWorkout}>
                    <Text style={styles.completeButtonText}>Complete Workout</Text>
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
        gap: 8
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
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
        alignItems: 'center'
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    }
})
