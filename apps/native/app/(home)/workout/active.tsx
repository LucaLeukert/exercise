import { useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { Button, Card, useTheme } from '@/ui'
import { Theme } from '@/ui/theme/themes'
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
    theme: Theme
}

function SetInputRow({ set, index, onUpdate, theme }: SetInputProps) {
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
        <View style={[styles.setInputs, { gap: theme.spacing[3] }]}>
            <View style={styles.inputGroup}>
                <Text
                    style={[
                        styles.inputLabel,
                        {
                            color: theme.colors.textSecondary,
                            fontSize: theme.fontSizes.xs,
                            fontWeight: theme.fontWeights.semibold,
                            marginBottom: theme.spacing[1]
                        }
                    ]}
                >
                    Weight
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            borderRadius: theme.borderRadius.md,
                            padding: theme.spacing[2],
                            fontSize: theme.fontSizes.md,
                            fontWeight: theme.fontWeights.semibold,
                            color: theme.colors.text,
                            backgroundColor: theme.colors.surfaceSecondary
                        }
                    ]}
                    value={localWeight}
                    onChangeText={setLocalWeight}
                    onBlur={handleWeightBlur}
                    onEndEditing={handleWeightBlur}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textMuted}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text
                    style={[
                        styles.inputLabel,
                        {
                            color: theme.colors.textSecondary,
                            fontSize: theme.fontSizes.xs,
                            fontWeight: theme.fontWeights.semibold,
                            marginBottom: theme.spacing[1]
                        }
                    ]}
                >
                    Reps
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            borderRadius: theme.borderRadius.md,
                            padding: theme.spacing[2],
                            fontSize: theme.fontSizes.md,
                            fontWeight: theme.fontWeights.semibold,
                            color: theme.colors.text,
                            backgroundColor: theme.colors.surfaceSecondary
                        }
                    ]}
                    value={localReps}
                    onChangeText={setLocalReps}
                    onBlur={handleRepsBlur}
                    onEndEditing={handleRepsBlur}
                    keyboardType="numeric"
                    placeholder={String(set.targetReps)}
                    placeholderTextColor={theme.colors.textMuted}
                />
            </View>
        </View>
    )
}

export default function ActiveWorkoutPage() {
    const { theme } = useTheme()
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
            router.replace('/')
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
                router.replace('/')
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
                                router.replace('/')
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
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            edges={['bottom']}
        >
            <Stack.Screen
                options={{
                    title: 'Workout in Progress',
                    headerShown: true,
                    headerLeft: () => (
                        <Pressable
                            onPress={handleCancelWorkout}
                            style={{ padding: theme.spacing[2] }}
                        >
                            <Text
                                style={{
                                    color: theme.colors.error,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold
                                }}
                            >
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }}
            />

            {/* Stats Bar */}
            <View
                style={[
                    styles.statsBar,
                    {
                        backgroundColor: theme.colors.surface,
                        paddingHorizontal: theme.spacing[4],
                        paddingVertical: theme.spacing[3],
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                        gap: theme.spacing[4]
                    }
                ]}
            >
                <View style={[styles.statItem, { gap: theme.spacing[1] }]}>
                    <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
                    <Text
                        style={[
                            styles.statValue,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        {formatTime(elapsedTime)}
                    </Text>
                </View>
                <View style={[styles.statItem, { gap: theme.spacing[1] }]}>
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={theme.colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.statValue,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        {stats.completedSets}/{stats.totalSets}
                    </Text>
                </View>
                <View style={[styles.statItem, { gap: theme.spacing[1] }]}>
                    <Ionicons name="barbell-outline" size={18} color={theme.colors.textSecondary} />
                    <Text
                        style={[
                            styles.statValue,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        {stats.totalWeight} kg
                    </Text>
                </View>
                <View style={styles.syncIndicator}>
                    {isSyncing ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : syncError ? (
                        <Ionicons name="cloud-offline" size={18} color={theme.colors.error} />
                    ) : (
                        <Ionicons name="cloud-done" size={18} color={theme.colors.success} />
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
                        <View style={[styles.setContainer, { marginBottom: theme.spacing[4] }]}>
                            {isFirstSet && (
                                <View
                                    style={[
                                        styles.exerciseHeader,
                                        { marginBottom: theme.spacing[3] }
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.exerciseName,
                                            {
                                                color: theme.colors.text,
                                                fontSize: theme.fontSizes.xl,
                                                fontWeight: theme.fontWeights.bold,
                                                marginBottom: theme.spacing[1]
                                            }
                                        ]}
                                    >
                                        {exercise?.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.exerciseMeta,
                                            {
                                                color: theme.colors.textSecondary,
                                                fontSize: theme.fontSizes.sm
                                            }
                                        ]}
                                    >
                                        {exerciseSets.length} sets × {item.targetReps} reps
                                    </Text>
                                </View>
                            )}

                            <Card
                                elevation="sm"
                                padding="sm"
                                style={{
                                    marginBottom: theme.spacing[2],
                                    backgroundColor: item.completed
                                        ? theme.colors.success + '10'
                                        : theme.colors.surface,
                                    borderWidth: item.completed ? 1 : 0,
                                    borderColor: item.completed
                                        ? theme.colors.success
                                        : 'transparent'
                                }}
                            >
                                <View style={styles.setRow}>
                                    <View
                                        style={[
                                            styles.setNumber,
                                            {
                                                width: 32,
                                                height: 32,
                                                borderRadius: 16,
                                                backgroundColor: theme.colors.surfaceSecondary,
                                                marginRight: theme.spacing[3]
                                            }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.setNumberText,
                                                {
                                                    color: theme.colors.textSecondary,
                                                    fontSize: theme.fontSizes.sm,
                                                    fontWeight: theme.fontWeights.bold
                                                }
                                            ]}
                                        >
                                            {item.setNumber}
                                        </Text>
                                    </View>

                                    <SetInputRow
                                        set={item}
                                        index={index}
                                        onUpdate={handleUpdateSet}
                                        theme={theme}
                                    />

                                    <TogglePrimitive.Root
                                        style={({ pressed }) => [
                                            styles.checkButton,
                                            {
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                borderWidth: 2,
                                                borderColor: item.completed
                                                    ? theme.colors.success
                                                    : theme.colors.primary,
                                                backgroundColor: item.completed
                                                    ? theme.colors.success
                                                    : 'transparent',
                                                marginLeft: theme.spacing[3]
                                            },
                                            pressed && { opacity: 0.7 }
                                        ]}
                                        pressed={item.completed}
                                        onPressedChange={() =>
                                            handleUpdateSet(index, 'completed', !item.completed)
                                        }
                                    >
                                        <Ionicons
                                            name={
                                                item.completed ? 'checkmark' : 'checkmark-outline'
                                            }
                                            size={24}
                                            color={
                                                item.completed
                                                    ? theme.colors.successForeground
                                                    : theme.colors.primary
                                            }
                                        />
                                    </TogglePrimitive.Root>
                                </View>
                            </Card>
                        </View>
                    )
                }}
                keyExtractor={(item, index) => `${item.exerciseId}-${index}`}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingHorizontal: theme.spacing[5],
                        paddingVertical: theme.spacing[4]
                    }
                ]}
            />

            <View
                style={[
                    styles.footer,
                    {
                        padding: theme.spacing[5],
                        backgroundColor: theme.colors.surface,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.border
                    }
                ]}
            >
                <Button
                    title="Complete Workout"
                    onPress={handleCompleteWorkout}
                    disabled={isCompleting}
                    loading={isCompleting}
                    fullWidth
                    style={{ backgroundColor: theme.colors.success }}
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
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statValue: {},
    syncIndicator: {
        marginLeft: 'auto'
    },
    listContent: {},
    setContainer: {},
    exerciseHeader: {},
    exerciseName: {},
    exerciseMeta: {},
    setRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    setNumber: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    setNumberText: {},
    setInputs: {
        flex: 1,
        flexDirection: 'row'
    },
    inputGroup: {
        flex: 1
    },
    inputLabel: {},
    input: {
        textAlign: 'center'
    },
    checkButton: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    footer: {}
})
