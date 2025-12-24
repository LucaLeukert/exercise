import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { SignOutButton } from '@/components/auth/SignOut'
import { Button, Card, Badge, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { wrapConvexMutation } from '@/utils/result'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'
import { useWorkoutSession } from '@/utils/useWorkoutSession'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useMutation, useQuery } from 'convex/react'

export default function HomePage() {
    const { user } = useUser()
    const { theme } = useTheme()

    const routines = useQuery(api.routines.list, {})
    const isLoading = routines === undefined
    // TODO: Use recentWorkouts for workout history section
    // const recentWorkouts = useQuery(api.workouts.recent, {})
    const deleteRoutineMutation = useMutation(api.routines.remove)

    const { forceSync, clearDatabase } = useExerciseDatabase()
    const { activeSession } = useWorkoutSession()

    // Find active workout routine name
    const activeWorkoutRoutine = routines?.find((r) => r._id === activeSession?.routineId)

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        return `${hours}h ${minutes % 60}m`
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen
                options={{
                    title: 'Home',
                    headerShown: false
                }}
            />

            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.colors.surface,
                        paddingHorizontal: theme.spacing[5],
                        paddingTop: theme.spacing[4],
                        paddingBottom: theme.spacing[6],
                        borderBottomColor: theme.colors.border
                    }
                ]}
            >
                <View>
                    <Text
                        style={[
                            styles.greeting,
                            {
                                color: theme.colors.textTertiary,
                                fontSize: theme.fontSizes.sm,
                                marginBottom: theme.spacing[1]
                            }
                        ]}
                    >
                        Welcome back
                    </Text>
                    <Text
                        style={[
                            styles.userName,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes['4xl'],
                                fontWeight: theme.fontWeights.extrabold
                            }
                        ]}
                    >
                        {user?.firstName || 'User'}
                    </Text>
                </View>
                <View style={[styles.headerButtons, { gap: theme.spacing[3] }]}>
                    <TouchableOpacity onPress={() => router.push('/(home)/friends')}>
                        <Ionicons name="people" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(home)/profile')}
                        style={{ marginRight: theme.spacing[2] }}
                    >
                        <Ionicons name="person-circle" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <SignOutButton />
                </View>
            </View>

            {/* Active Workout Banner */}
            {activeSession?.status === 'active' && (
                <Pressable
                    style={[
                        styles.activeWorkoutBanner,
                        {
                            backgroundColor: theme.colors.primary,
                            marginHorizontal: theme.spacing[5],
                            marginTop: theme.spacing[4],
                            borderRadius: theme.borderRadius.lg,
                            padding: theme.spacing[4]
                        }
                    ]}
                    onPress={() => {
                        router.push('/workout/active')
                    }}
                >
                    <View style={[styles.activeWorkoutInfo, { gap: theme.spacing[3] }]}>
                        <View
                            style={[
                                styles.activeWorkoutPulse,
                                {
                                    width: theme.spacing[3],
                                    height: theme.spacing[3],
                                    borderRadius: theme.spacing[1.5],
                                    backgroundColor: theme.colors.success
                                }
                            ]}
                        />
                        <View>
                            <Text
                                style={[
                                    styles.activeWorkoutLabel,
                                    {
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: theme.fontSizes.xs,
                                        marginBottom: theme.spacing[0.5]
                                    }
                                ]}
                            >
                                Workout in Progress
                            </Text>
                            <Text
                                style={[
                                    styles.activeWorkoutName,
                                    {
                                        color: theme.colors.primaryForeground,
                                        fontSize: theme.fontSizes.md,
                                        fontWeight: theme.fontWeights.bold
                                    }
                                ]}
                            >
                                {activeWorkoutRoutine?.name ?? 'Quick Workout'}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.activeWorkoutAction, { gap: theme.spacing[2] }]}>
                        <Text
                            style={[
                                styles.activeWorkoutTime,
                                {
                                    color: theme.colors.primaryForeground,
                                    fontSize: theme.fontSizes.sm,
                                    fontWeight: theme.fontWeights.semibold
                                }
                            ]}
                        >
                            {formatDuration(Date.now() - activeSession.startedAt)}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.primaryForeground} />
                    </View>
                </Pressable>
            )}

            {/* Action Buttons */}
            <View
                style={[
                    styles.actionButtons,
                    {
                        paddingHorizontal: theme.spacing[5],
                        paddingVertical: theme.spacing[4],
                        gap: theme.spacing[3]
                    }
                ]}
            >
                <Pressable
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[4],
                            borderRadius: theme.borderRadius.lg,
                            gap: theme.spacing[2]
                        },
                        theme.shadows.sm
                    ]}
                    onPress={() => router.push('/create')}
                >
                    <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: theme.colors.primary,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        Create Routine
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[4],
                            borderRadius: theme.borderRadius.lg,
                            gap: theme.spacing[2]
                        },
                        theme.shadows.sm
                    ]}
                    onPress={() => router.push('/exercises')}
                >
                    <Ionicons name="list" size={24} color={theme.colors.primary} />
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: theme.colors.primary,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        Browse Exercises
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[4],
                            borderRadius: theme.borderRadius.lg,
                            gap: theme.spacing[2]
                        },
                        theme.shadows.sm
                    ]}
                    onPress={() => clearDatabase()}
                >
                    <Ionicons name="trash-bin" size={24} color={theme.colors.error} />
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: theme.colors.error,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        Clear Database
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[4],
                            borderRadius: theme.borderRadius.lg,
                            gap: theme.spacing[2]
                        },
                        theme.shadows.sm
                    ]}
                    onPress={() => forceSync()}
                >
                    <Ionicons name="sync" size={24} color={theme.colors.success} />
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: theme.colors.success,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        Sync Exercises
                    </Text>
                </Pressable>
            </View>

            {/* Routines Section */}
            <View style={[styles.routinesSection, { paddingHorizontal: theme.spacing[5] }]}>
                <Text
                    style={[
                        styles.sectionTitle,
                        {
                            color: theme.colors.text,
                            fontSize: theme.fontSizes['3xl'],
                            fontWeight: theme.fontWeights.bold,
                            marginBottom: theme.spacing[4]
                        }
                    ]}
                >
                    My Routines
                </Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : !routines || routines.length === 0 ? (
                    <View style={[styles.emptyState, { paddingVertical: theme.spacing[15] }]}>
                        <Ionicons name="fitness" size={64} color={theme.colors.textTertiary} />
                        <Text
                            style={[
                                styles.emptyStateText,
                                {
                                    color: theme.colors.textSecondary,
                                    fontSize: theme.fontSizes.xl,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginTop: theme.spacing[4],
                                    marginBottom: theme.spacing[2]
                                }
                            ]}
                        >
                            No routines yet
                        </Text>
                        <Text
                            style={[
                                styles.emptyStateSubtext,
                                {
                                    color: theme.colors.textTertiary,
                                    fontSize: theme.fontSizes.sm,
                                    textAlign: 'center'
                                }
                            ]}
                        >
                            Create your first routine to get started
                        </Text>
                    </View>
                ) : (
                    <FlashList
                        data={routines}
                        renderItem={({ item }) => (
                            <Card
                                elevation="sm"
                                padding="md"
                                style={[styles.routineCard, { marginBottom: theme.spacing[3] }]}
                            >
                                <View
                                    style={[
                                        styles.routineHeader,
                                        { marginBottom: theme.spacing[2] }
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.routineName,
                                            {
                                                color: theme.colors.text,
                                                fontSize: theme.fontSizes.xl,
                                                fontWeight: theme.fontWeights.bold,
                                                flex: 1
                                            }
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                    <Badge variant="secondary" size="sm">
                                        {item.exercises.length} exercises
                                    </Badge>

                                    <TouchableOpacity
                                        onPress={async () => {
                                            const result = await wrapConvexMutation(
                                                deleteRoutineMutation,
                                                { id: item._id },
                                                (error) => ({
                                                    type: 'mutation_error' as const,
                                                    message: 'Failed to delete routine',
                                                    originalError: error
                                                })
                                            )

                                            result.match(
                                                () => {
                                                    // Success - routine deleted
                                                },
                                                (error) => {
                                                    console.error(
                                                        'Failed to delete routine:',
                                                        error
                                                    )
                                                }
                                            )
                                        }}
                                    >
                                        <Ionicons
                                            name="trash-bin"
                                            size={20}
                                            color={theme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {item.description && (
                                    <Text
                                        style={[
                                            styles.routineDescription,
                                            {
                                                color: theme.colors.textSecondary,
                                                fontSize: theme.fontSizes.sm,
                                                marginBottom: theme.spacing[3],
                                                lineHeight: theme.fontSizes.sm * 1.43
                                            }
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {item.description}
                                    </Text>
                                )}
                                <Button
                                    title="Start Workout"
                                    onPress={() => router.push(`/(home)/workout/${item._id}`)}
                                    leftIcon={<Ionicons name="play-circle" size={20} color="#fff" />}
                                    fullWidth
                                />
                            </Card>
                        )}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: theme.spacing[5] }
                        ]}
                    />
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    greeting: {},
    userName: {},
    actionButtons: {
        flexDirection: 'row'
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    actionButtonText: {},
    routinesSection: {
        flex: 1
    },
    sectionTitle: {},
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyStateText: {},
    emptyStateSubtext: {},
    listContent: {},
    routineCard: {},
    routineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    routineName: {},
    routineDescription: {},
    activeWorkoutBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    activeWorkoutInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    activeWorkoutPulse: {},
    activeWorkoutLabel: {},
    activeWorkoutName: {},
    activeWorkoutAction: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    activeWorkoutTime: {}
})
