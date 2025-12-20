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
import { Button } from '@/components/Button'
import { useDeleteRoutine, useRoutines } from '@/utils/convex'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'
import { useWorkoutSession } from '@/utils/useWorkoutSession'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'

export default function HomePage() {
    const { user } = useUser()

    const routines = useRoutines()
    const isLoading = routines === undefined
    // TODO: Use recentWorkouts for workout history section
    // const recentWorkouts = useRecentWorkouts()
    const deleteRoutineMutation = useDeleteRoutine()

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
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Home',
                    headerShown: false
                }}
            />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back</Text>
                    <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
                </View>
                <SignOutButton />
            </View>

            {/* Active Workout Banner */}
            {activeSession?.status === 'active' && (
                <TouchableOpacity
                    style={styles.activeWorkoutBanner}
                    onPress={() => {
                        // Navigate to the workout - use routineId if available, otherwise use a special quick workout route
                        if (activeSession.routineId) {
                            router.push(`/workout/${activeSession.routineId}`)
                        } else {
                            // For quick workouts, we need to resume based on workoutId
                            // For now, navigate to a quick workout page
                            router.push('/workout/quick')
                        }
                    }}
                >
                    <View style={styles.activeWorkoutInfo}>
                        <View style={styles.activeWorkoutPulse} />
                        <View>
                            <Text style={styles.activeWorkoutLabel}>Workout in Progress</Text>
                            <Text style={styles.activeWorkoutName}>
                                {activeWorkoutRoutine?.name ?? 'Quick Workout'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.activeWorkoutAction}>
                        <Text style={styles.activeWorkoutTime}>
                            {formatDuration(Date.now() - activeSession.startedAt)}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <Pressable
                    style={styles.actionButton}
                    onPress={() => router.push('/create')}
                >
                    <Ionicons name="add-circle" size={24} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Create Routine</Text>
                </Pressable>

                <Pressable
                    style={styles.actionButton}
                    onPress={() => router.push('/exercises')}
                >
                    <Ionicons name="list" size={24} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Browse Exercises</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={() => clearDatabase()}>
                    <Ionicons name="trash-bin" size={24} color="#FF3B30" />
                    <Text style={styles.actionButtonText}>Clear Database</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={() => forceSync()}>
                    <Ionicons name="sync" size={24} color="#34C759" />
                    <Text style={styles.actionButtonText}>Sync Exercises</Text>
                </Pressable>
            </View>

            {/* Routines Section */}
            <View style={styles.routinesSection}>
                <Text style={styles.sectionTitle}>My Routines</Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : !routines || routines.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="fitness" size={64} color="#ddd" />
                        <Text style={styles.emptyStateText}>No routines yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Create your first routine to get started
                        </Text>
                    </View>
                ) : (
                    <FlashList
                        data={routines}
                        renderItem={({ item }) => (
                            <View style={styles.routineCard}>
                                <View style={styles.routineHeader}>
                                    <Text style={styles.routineName}>{item.name}</Text>
                                    <View style={styles.exerciseCountBadge}>
                                        <Text style={styles.exerciseCountText}>
                                            {item.exercises.length} exercises
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            void deleteRoutineMutation({ id: item._id })
                                        }}
                                    >
                                        <Ionicons name="trash-bin" size={20} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>
                                {item.description && (
                                    <Text style={styles.routineDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                                <Button onPress={() => router.push(`/(home)/workout/${item._id}`)}>
                                    <Ionicons name="play-circle" size={20} color="#fff" />
                                    <Text style={styles.startButtonText}>Start Workout</Text>
                                </Button>
                            </View>
                        )}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    greeting: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000'
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF'
    },
    routinesSection: {
        flex: 1,
        paddingHorizontal: 20
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 8
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center'
    },
    listContent: {
        paddingBottom: 20
    },
    routineCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    routineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    routineName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        flex: 1
    },
    exerciseCountBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    exerciseCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666'
    },
    routineDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20
    },
    startButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    activeWorkoutBanner: {
        backgroundColor: '#007AFF',
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    activeWorkoutInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    activeWorkoutPulse: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#34C759'
    },
    activeWorkoutLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2
    },
    activeWorkoutName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff'
    },
    activeWorkoutAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    activeWorkoutTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff'
    }
})
