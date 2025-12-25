import { useMemo } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'
import { BackButton } from '@/components/BackButton'
import { Avatar, Badge, Card, Separator, Text, TextWeight, Theme, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { useAction, useQuery } from 'convex/react'

import type { WorkoutSet } from '@/utils/useWorkoutSession'

const Screen = ({ theme }: { theme: Theme }) => (
    <Stack.Screen
        options={{
            title: 'Spectating Workout',
            headerShown: true,
            headerLeft: () => <BackButton />,
            headerStyle: {
                backgroundColor: theme.colors.surface
            },
            headerTintColor: theme.colors.text
        }}
    />
)

export default function SpectateWorkoutPage() {
    const { theme } = useTheme()
    const { user: currentUser } = useUser()
    const { id } = useLocalSearchParams<{ id: string }>()

    const workout = useQuery(api.workouts.getById, id ? { workoutId: id as any } : 'skip')
    const routine = useQuery(
        api.routines.getById,
        workout?.routineId ? { id: workout.routineId } : 'skip'
    )

    const clerkProfileAction = useAction(api.userProfiles.getClerkPublicInfo)

    const { data: clerkInfo } = useReactQuery({
        queryKey: ['clerkProfile', workout?.userId],
        queryFn: async () => {
            if (!workout?.userId) return null
            return await clerkProfileAction({ userId: workout.userId })
        },
        enabled: !!workout?.userId && workout.userId !== currentUser?.id,
        staleTime: 5 * 60 * 1000
    })

    // Get unique exercise IDs from workout sets
    const exerciseIds = useMemo(() => {
        if (!workout?.state?.sets) return []
        const uniqueIds = new Set<string>()
        workout.state.sets.forEach((set) => {
            uniqueIds.add(set.exerciseId)
        })
        return Array.from(uniqueIds)
    }, [workout?.state?.sets])

    // Get exercise details
    const exercises = useQuery(
        api.exercises.getByIds,
        exerciseIds.length > 0 ? { ids: exerciseIds } : 'skip'
    )

    // Create a map of exerciseId -> exercise name
    const exerciseMap = useMemo(() => {
        const map = new Map<string, string>()
        if (exercises?.exercises) {
            exercises.exercises.forEach((ex) => {
                map.set(ex.externalId, ex.name)
            })
        }
        return map
    }, [exercises])

    // Group sets by exercise
    const setsByExercise = useMemo(() => {
        if (!workout?.state?.sets) return new Map<string, WorkoutSet[]>()
        const map = new Map<string, WorkoutSet[]>()
        workout.state.sets.forEach((set) => {
            const existing = map.get(set.exerciseId) || []
            map.set(set.exerciseId, [...existing, set])
        })
        return map
    }, [workout?.state?.sets])

    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    if (!id) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                edges={['bottom']}
            >
                <Screen theme={theme} />
                <View style={styles.errorContainer}>
                    <Text variant="secondary" size="md">
                        Workout ID is required
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    if (workout === undefined) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                edges={['bottom']}
            >
                <Screen theme={theme} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        )
    }

    if (workout === null) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                edges={['bottom']}
            >
                <Screen theme={theme} />
                <View style={styles.errorContainer}>
                    <Ionicons name="lock-closed" size={64} color={theme.colors.textTertiary} />
                    <Text
                        variant="secondary"
                        size="lg"
                        weight="semibold"
                        style={{ marginTop: theme.spacing[4] }}
                    >
                        Workout not found
                    </Text>
                    <Text variant="tertiary" size="sm" style={{ marginTop: theme.spacing[2] }}>
                        This workout may be private or no longer available
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    if (workout.status !== 'active') {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                edges={['bottom']}
            >
                <Screen theme={theme} />
                <View style={styles.errorContainer}>
                    <Ionicons name="checkmark-circle" size={64} color={theme.colors.textTertiary} />
                    <Text
                        variant="secondary"
                        size="lg"
                        weight="semibold"
                        style={{ marginTop: theme.spacing[4] }}
                    >
                        Workout completed
                    </Text>
                    <Text variant="tertiary" size="sm" style={{ marginTop: theme.spacing[2] }}>
                        This workout is no longer active
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    const isOwnWorkout = workout.userId === currentUser?.id
    const displayName = isOwnWorkout
        ? currentUser?.fullName || currentUser?.firstName || 'You'
        : clerkInfo?.fullName || clerkInfo?.firstName || workout.userId.slice(0, 8) + '...'
    const avatarUrl = isOwnWorkout ? currentUser?.imageUrl || null : clerkInfo?.imageUrl || null
    const fallback = isOwnWorkout
        ? currentUser?.firstName?.[0] || currentUser?.fullName?.[0] || 'U'
        : clerkInfo?.firstName?.[0]?.toUpperCase() ||
          clerkInfo?.fullName?.[0]?.toUpperCase() ||
          workout.userId[0]?.toUpperCase() ||
          'U'

    const duration = Date.now() - workout.startedAt
    const routineName = routine?.name || 'Quick Workout'

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            edges={['bottom']}
        >
            <Screen theme={theme} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { padding: theme.spacing[5] }]}
            >
                <Card elevation="sm" padding="lg" style={{ marginBottom: theme.spacing[4] }}>
                    <View style={[styles.header, { marginBottom: theme.spacing[4] }]}>
                        <Avatar size="md" source={avatarUrl} fallback={fallback} />
                        <View style={{ marginLeft: theme.spacing[3], flex: 1 }}>
                            <Text variant="default" size="md" weight="semibold">
                                {displayName}
                            </Text>
                            <Text variant="secondary" size="sm">
                                {routineName}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Badge variant="error">
                                <Text variant="default" size="xs" weight="bold">
                                    LIVE
                                </Text>
                            </Badge>
                            <Text
                                variant="secondary"
                                size="sm"
                                style={{ marginTop: theme.spacing[1] }}
                            >
                                {formatDuration(duration)}
                            </Text>
                        </View>
                    </View>
                </Card>

                {setsByExercise.size === 0 ? (
                    <Card elevation="sm" padding="lg">
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="fitness-outline"
                                size={48}
                                color={theme.colors.textTertiary}
                            />
                            <Text
                                variant="secondary"
                                size="md"
                                style={{ marginTop: theme.spacing[3], textAlign: 'center' }}
                            >
                                No exercises started yet
                            </Text>
                        </View>
                    </Card>
                ) : (
                    Array.from(setsByExercise.entries()).map(([exerciseId, sets]) => {
                        const exerciseName = exerciseMap.get(exerciseId) || exerciseId
                        const completedSets = sets.filter((s) => s.completed).length
                        const totalSets = sets.length

                        return (
                            <Card
                                key={exerciseId}
                                elevation="sm"
                                padding="md"
                                style={{ marginBottom: theme.spacing[3] }}
                            >
                                <View style={{ marginBottom: theme.spacing[3] }}>
                                    <Text variant="default" size="lg" weight="semibold">
                                        {exerciseName}
                                    </Text>
                                    <Text variant="secondary" size="sm">
                                        {completedSets} of {totalSets} sets completed
                                    </Text>
                                </View>

                                <Separator
                                    orientation="horizontal"
                                    style={{ marginBottom: theme.spacing[3] }}
                                />

                                <View style={{ gap: theme.spacing[2] }}>
                                    {sets.map((set, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.setRow,
                                                {
                                                    backgroundColor: set.completed
                                                        ? theme.colors.primary + '20'
                                                        : theme.colors.surface,
                                                    padding: theme.spacing[2],
                                                    borderRadius: theme.borderRadius.sm
                                                }
                                            ]}
                                        >
                                            <Text
                                                variant="default"
                                                size="sm"
                                                weight={
                                                    set.completed
                                                        ? 'semibold'
                                                        : ('regular' as TextWeight)
                                                }
                                            >
                                                Set {set.setNumber}
                                            </Text>
                                            <View style={styles.setInfo}>
                                                <Text variant="secondary" size="sm">
                                                    {set.completedReps} / {set.targetReps} reps
                                                </Text>
                                                {set.weight > 0 && (
                                                    <Text variant="secondary" size="sm">
                                                        {set.weight} kg
                                                    </Text>
                                                )}
                                            </View>
                                            {set.completed && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={20}
                                                    color={theme.colors.success}
                                                />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </Card>
                        )
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        flex: 1
    },
    content: {
        flexGrow: 1
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
    header: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    setInfo: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center'
    }
})
