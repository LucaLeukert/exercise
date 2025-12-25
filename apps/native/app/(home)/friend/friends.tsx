import type { ReactMutation } from 'convex/react'
import React, { useMemo } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { BackButton } from '@/components/BackButton'
import { Avatar, Badge, Button, Card, Skeleton, SkeletonAvatar, Text, Theme, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { useAction, useMutation, useQuery } from 'convex/react'

import type { Id } from '@packages/backend/convex/_generated/dataModel'

const Screen = ({ theme }: { theme: Theme }) => (
    <Stack.Screen
        options={{
            title: 'Friends',
            headerShown: true,
            headerLeft: () => <BackButton />,
            headerStyle: {
                backgroundColor: theme.colors.surface
            },
            headerTintColor: theme.colors.text
        }}
    />
)

type UserProfileDisplayProps = {
    userId: string
    theme: Theme
}

const UserProfileDisplay = ({ userId, theme }: UserProfileDisplayProps) => {
    const profile = useQuery(api.userProfiles.getByUserId, { userId })
    const clerkProfileAction = useAction(api.userProfiles.getClerkPublicInfo)

    // Use React Query to call the Convex action
    const { data: clerkInfo, isLoading: isLoadingClerkInfo } = useReactQuery({
        queryKey: ['clerkProfile', userId],
        queryFn: async () => {
            return await clerkProfileAction({ userId })
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    })

    if (!profile || isLoadingClerkInfo) {
        return (
            <View style={[styles.friendInfo, { gap: theme.spacing[3] }]}>
                <SkeletonAvatar size="md" />
                <View style={{ flex: 1, gap: theme.spacing[1] }}>
                    <Skeleton width={120} height={16} borderRadius={4} />
                    <Skeleton width={60} height={12} borderRadius={4} />
                </View>
            </View>
        )
    }

    // Use Clerk info if available, otherwise fallback to user ID
    const displayName = clerkInfo?.fullName || clerkInfo?.firstName || userId.slice(0, 8) + '...'
    const fallback =
        clerkInfo?.firstName?.[0]?.toUpperCase() ||
        clerkInfo?.fullName?.[0]?.toUpperCase() ||
        userId[0]?.toUpperCase() ||
        'U'
    const imageUrl = clerkInfo?.imageUrl || null

    return (
        <Pressable onPress={() => router.push(`/profile/${userId}`)} style={styles.friendInfo}>
            <Avatar size="md" source={imageUrl} fallback={fallback} />
            <View
                style={{
                    marginLeft: theme.spacing[3],
                    gap: theme.spacing[2]
                }}
            >
                <Text variant="default" size="md" weight="semibold">
                    {displayName}
                </Text>

                <Badge variant="secondary" size="sm">
                    Friend
                </Badge>
            </View>
        </Pressable>
    )
}

type ActiveWorkoutBadgeProps = {
    workoutId: Id<'workoutSessions'>
    userId: string
    theme: Theme
}

const ActiveWorkoutBadge = ({ workoutId, userId, theme }: ActiveWorkoutBadgeProps) => {
    const workout = useQuery(api.workouts.getById, { workoutId })
    const routine = useQuery(
        api.routines.getById,
        workout?.routineId ? { id: workout.routineId } : 'skip'
    )

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        return `${hours}h ${minutes % 60}m`
    }

    if (!workout || !routine) {
        return (
            <Card
                elevation="sm"
                padding="sm"
                style={{ marginBottom: theme.spacing[2], backgroundColor: theme.colors.primary }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: theme.spacing[2]
                        }}
                    >
                        <View
                            style={[
                                styles.pulseDot,
                                {
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: theme.colors.primaryForeground
                                }
                            ]}
                        />
                        <Skeleton width={100} height={16} borderRadius={4} />
                        <Skeleton width={30} height={12} borderRadius={4} />
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.primaryForeground}
                    />
                </View>
            </Card>
        )
    }

    if (!workout || workout.status !== 'active') {
        return null
    }

    const duration = Date.now() - workout.startedAt
    const routineName = routine?.name

    return (
        <Pressable onPress={() => router.push(`/workout/spectate/${workoutId}`)}>
            <Card
                elevation="sm"
                padding="sm"
                style={{ marginBottom: theme.spacing[2], backgroundColor: theme.colors.primary }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
                    <View
                        style={[
                            styles.pulseDot,
                            {
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: theme.colors.primaryForeground
                            }
                        ]}
                    />
                    <Text
                        variant="default"
                        size="sm"
                        weight="semibold"
                        style={{ color: theme.colors.primaryForeground, flex: 1 }}
                    >
                        {routineName}
                    </Text>
                    <Text
                        variant="secondary"
                        size="xs"
                        style={{ color: theme.colors.primaryForeground }}
                    >
                        {formatDuration(duration)}
                    </Text>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.primaryForeground}
                    />
                </View>
            </Card>
        </Pressable>
    )
}

type FriendRequest = {
    _id: Id<'friends'>
    requesterId: string
    recipientId: string
}

type Friend = {
    _id: Id<'friends'>
    requesterId: string
    recipientId: string
    status: string
}

type PendingRequestsProps = {
    pendingRequests: FriendRequest[]
    userId: string
    theme: Theme
    acceptRequest: ReactMutation<typeof api.friends.acceptRequest>
    removeFriend: ReactMutation<typeof api.friends.remove>
}

const PendingRequests = ({
    pendingRequests,
    userId,
    theme,
    acceptRequest,
    removeFriend
}: PendingRequestsProps) => {
    if (pendingRequests.length === 0) {
        return null
    }

    return (
        <View style={{ marginBottom: theme.spacing[6] }}>
            <Text
                variant="default"
                size="xl"
                weight="bold"
                style={{ marginBottom: theme.spacing[3] }}
            >
                Friend Requests
            </Text>
            {pendingRequests.map((request) => {
                const isRequester = request.requesterId === userId
                const otherUserId = isRequester ? request.recipientId : request.requesterId

                return (
                    <Card
                        key={request._id}
                        elevation="sm"
                        padding="md"
                        style={{ marginBottom: theme.spacing[2] }}
                    >
                        <View style={[styles.friendItem, { justifyContent: 'space-between' }]}>
                            <View style={{ flex: 1 }}>
                                <UserProfileDisplay userId={otherUserId} theme={theme} />
                                <View
                                    style={{
                                        marginLeft: 48 + theme.spacing[3],
                                        marginTop: theme.spacing[1]
                                    }}
                                >
                                    <Text variant="secondary" size="sm">
                                        {isRequester ? 'Sent' : 'Received'}
                                    </Text>
                                </View>
                            </View>
                            {!isRequester && (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        gap: theme.spacing[2]
                                    }}
                                >
                                    <Button
                                        title="Accept"
                                        onPress={async () => {
                                            await acceptRequest({
                                                friendId: request._id
                                            })
                                        }}
                                        variant="primary"
                                        size="sm"
                                    />
                                    <Button
                                        title="Decline"
                                        onPress={async () => {
                                            await removeFriend({
                                                friendId: request._id
                                            })
                                        }}
                                        variant="outline"
                                        size="sm"
                                    />
                                </View>
                            )}
                        </View>
                    </Card>
                )
            })}
        </View>
    )
}

type FriendsListProps = {
    acceptedFriends: Friend[]
    userId: string
    theme: Theme
    removeFriend: ReactMutation<typeof api.friends.remove>
}

const FriendsList = ({ acceptedFriends, userId, theme, removeFriend }: FriendsListProps) => {
    // Get all active workouts from friends
    const spectatableWorkouts = useQuery(api.workouts.getSpectatableWorkouts, {})

    // Create a map of userId -> active workout
    const activeWorkoutsByUserId = useMemo(() => {
        const map = new Map<string, Id<'workoutSessions'>>()
        if (spectatableWorkouts) {
            for (const workout of spectatableWorkouts) {
                map.set(workout.userId, workout._id)
            }
        }
        return map
    }, [spectatableWorkouts])

    return (
        <>
            <Text
                variant="default"
                size="xl"
                weight="bold"
                style={{ marginBottom: theme.spacing[3] }}
            >
                Friends ({acceptedFriends.length})
            </Text>

            {acceptedFriends.length === 0 ? (
                <View style={[styles.emptyState, { paddingVertical: theme.spacing[16] }]}>
                    <Ionicons name="people-outline" size={64} color={theme.colors.textTertiary} />
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
                        No friends yet
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
                        Start adding friends to see them here
                    </Text>
                </View>
            ) : (
                <FlashList
                    data={acceptedFriends}
                    renderItem={({ item }) => {
                        const isRequester = item.requesterId === userId
                        const otherUserId = isRequester ? item.recipientId : item.requesterId

                        return (
                            <Pressable
                                onPress={() => router.push(`/profile/${otherUserId}`)}
                                style={{ marginBottom: theme.spacing[2] }}
                            >
                                <Card
                                    elevation="sm"
                                    padding="md"
                                    style={{ marginBottom: theme.spacing[2] }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <View
                                            style={[
                                                styles.friendItem,
                                                {
                                                    justifyContent: 'space-between',
                                                    marginBottom: theme.spacing[2]
                                                }
                                            ]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <UserProfileDisplay
                                                    userId={otherUserId}
                                                    theme={theme}
                                                />
                                            </View>
                                            <Button
                                                onPress={async (e) => {
                                                    e.stopPropagation()
                                                    await removeFriend({ friendId: item._id })
                                                }}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={20}
                                                    color={theme.colors.error}
                                                />
                                            </Button>
                                        </View>
                                        {activeWorkoutsByUserId.has(otherUserId) && (
                                            <ActiveWorkoutBadge
                                                workoutId={activeWorkoutsByUserId.get(otherUserId)!}
                                                userId={otherUserId}
                                                theme={theme}
                                            />
                                        )}
                                    </View>
                                </Card>
                            </Pressable>
                        )
                    }}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: theme.spacing[5] }}
                />
            )}
        </>
    )
}

export default function FriendsPage() {
    const { user } = useUser()
    const { theme } = useTheme()
    const userId = user?.id || ''

    const friends = useQuery(api.friends.getByUserId, { userId })
    const friendRequests = useQuery(api.friends.getRequests, { userId })
    const acceptRequest = useMutation(api.friends.acceptRequest)
    const removeFriend = useMutation(api.friends.remove)

    const isLoading = friends === undefined || friendRequests === undefined

    // Filter accepted friends
    const acceptedFriends = friends?.filter((f) => f.status === 'accepted') || []
    // Get received requests
    const receivedRequests = friendRequests || []
    // Get sent requests (pending where user is requester)
    const sentRequests =
        friends?.filter((f) => f.status === 'pending' && f.requesterId === userId) || []
    // Combine all pending requests
    const pendingRequests = [...receivedRequests, ...sentRequests]

    if (isLoading) {
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

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            edges={['bottom']}
        >
            <Screen theme={theme} />

            <View style={[styles.content, { padding: theme.spacing[5] }]}>
                <PendingRequests
                    pendingRequests={pendingRequests}
                    userId={userId}
                    theme={theme}
                    acceptRequest={acceptRequest}
                    removeFriend={removeFriend}
                />
                <FriendsList
                    acceptedFriends={acceptedFriends}
                    userId={userId}
                    theme={theme}
                    removeFriend={removeFriend}
                />
            </View>

            {/* Floating Add Button */}
            <Pressable
                style={[
                    styles.fab,
                    {
                        backgroundColor: theme.colors.primary,
                        shadowColor: '#000'
                    }
                ]}
                onPress={() => router.push('/friend/add-friend')}
            >
                <Ionicons name="add" size={28} color={theme.colors.primaryForeground} />
            </Pressable>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyStateText: {},
    emptyStateSubtext: {},
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    activeWorkoutBadge: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    }
})
