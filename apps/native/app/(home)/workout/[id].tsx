import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { VisibilitySelector } from '@/components/VisibilitySelector'
import { Button, useTheme } from '@/ui'
import { RoutineId } from '@/utils/convex'
import { useWorkoutSession, WorkoutSet } from '@/utils/useWorkoutSession'
import { isValidConvexId } from '@/utils/workoutUtils'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@packages/backend'
import { useQuery } from 'convex/react'

export default function StartWorkoutPage() {
    const { theme } = useTheme()
    const { id } = useLocalSearchParams<{ id: string }>()
    const isQuickWorkout = !isValidConvexId(id)
    const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('private')

    const routine = useQuery(
        api.routines.getById,
        isQuickWorkout ? 'skip' : { id: id as RoutineId }
    )
    const isLoading = routine === undefined && !isQuickWorkout

    const { hasActiveWorkout, startWorkout, isStarting } = useWorkoutSession()

    // For routine workouts, use the routine's visibility
    useEffect(() => {
        if (routine && !isQuickWorkout) {
            setVisibility(routine.visibility)
        }
    }, [routine, isQuickWorkout])

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
        // For routine workouts, visibility is determined by the routine (handled in backend)
        // For quick workouts, use the selected visibility
        const workoutVisibility = isQuickWorkout ? visibility : undefined
        const result = await startWorkout(routineId, initialSets, workoutVisibility)

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
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        )
    }

    if (!isQuickWorkout && !routine) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
                <View style={[styles.errorContainer, { padding: theme.spacing[5] }]}>
                    <Text
                        style={[
                            styles.errorText,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.fontSizes.md
                            }
                        ]}
                    >
                        Routine not found
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    // Quick workout start screen
    if (isQuickWorkout) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: 'Quick Workout', headerShown: true }} />
                <View style={[styles.preWorkoutContainer, { padding: theme.spacing[5] }]}>
                    <Ionicons name="flash" size={80} color={theme.colors.warning} />
                    <Text
                        style={[
                            styles.routineTitle,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes['4xl'],
                                fontWeight: theme.fontWeights.extrabold,
                                marginTop: theme.spacing[5],
                                marginBottom: theme.spacing[3]
                            }
                        ]}
                    >
                        Quick Workout
                    </Text>
                    <Text
                        style={[
                            styles.routineDescription,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.fontSizes.md,
                                marginBottom: theme.spacing[6]
                            }
                        ]}
                    >
                        Start an empty workout and add exercises as you go
                    </Text>

                    <VisibilitySelector value={visibility} onChange={setVisibility} />

                    <Button
                        title="Start Quick Workout"
                        onPress={handleStartWorkout}
                        disabled={isStarting}
                        loading={isStarting}
                        leftIcon={<Ionicons name="play-circle" size={24} color="#fff" />}
                        size="lg"
                    />
                </View>
            </SafeAreaView>
        )
    }

    // Routine workout start screen
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: routine?.name ?? 'Workout', headerShown: true }} />
            <View style={[styles.preWorkoutContainer, { padding: theme.spacing[5] }]}>
                <Ionicons name="fitness" size={80} color={theme.colors.primary} />
                <Text
                    style={[
                        styles.routineTitle,
                        {
                            color: theme.colors.text,
                            fontSize: theme.fontSizes['4xl'],
                            fontWeight: theme.fontWeights.extrabold,
                            marginTop: theme.spacing[5],
                            marginBottom: theme.spacing[3]
                        }
                    ]}
                >
                    {routine?.name}
                </Text>
                {routine?.description && (
                    <Text
                        style={[
                            styles.routineDescription,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.fontSizes.md,
                                marginBottom: theme.spacing[8]
                            }
                        ]}
                    >
                        {routine.description}
                    </Text>
                )}
                <View
                    style={[
                        styles.workoutInfo,
                        { gap: theme.spacing[10], marginBottom: theme.spacing[10] }
                    ]}
                >
                    <View style={styles.infoItem}>
                        <Text
                            style={[
                                styles.infoLabel,
                                {
                                    color: theme.colors.textTertiary,
                                    fontSize: theme.fontSizes.sm,
                                    marginBottom: theme.spacing[1]
                                }
                            ]}
                        >
                            Exercises
                        </Text>
                        <Text
                            style={[
                                styles.infoValue,
                                {
                                    color: theme.colors.primary,
                                    fontSize: theme.fontSizes['5xl'],
                                    fontWeight: theme.fontWeights.bold
                                }
                            ]}
                        >
                            {routine?.exercises.length ?? 0}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text
                            style={[
                                styles.infoLabel,
                                {
                                    color: theme.colors.textTertiary,
                                    fontSize: theme.fontSizes.sm,
                                    marginBottom: theme.spacing[1]
                                }
                            ]}
                        >
                            Total Sets
                        </Text>
                        <Text
                            style={[
                                styles.infoValue,
                                {
                                    color: theme.colors.primary,
                                    fontSize: theme.fontSizes['5xl'],
                                    fontWeight: theme.fontWeights.bold
                                }
                            ]}
                        >
                            {routine?.exercises.reduce((sum, ex) => sum + ex.sets, 0) ?? 0}
                        </Text>
                    </View>
                </View>

                {/* Only show visibility selector for quick workouts */}
                {isQuickWorkout && (
                    <VisibilitySelector value={visibility} onChange={setVisibility} />
                )}

                <Button
                    title="Start Workout"
                    onPress={handleStartWorkout}
                    disabled={isStarting}
                    loading={isStarting}
                    leftIcon={<Ionicons name="play-circle" size={24} color="#fff" />}
                    size="lg"
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        textAlign: 'center'
    },
    preWorkoutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    routineTitle: {
        textAlign: 'center'
    },
    routineDescription: {
        textAlign: 'center'
    },
    workoutInfo: {
        flexDirection: 'row'
    },
    infoItem: {
        alignItems: 'center'
    },
    infoLabel: {},
    infoValue: {}
})
