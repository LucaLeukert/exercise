import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, router } from 'expo-router'
import { BackButton } from '@/components/BackButton'
import { Avatar, Badge, Button, Card, Text, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { useQuery, useMutation } from 'convex/react'
import { FlashList } from '@shopify/flash-list'
import { Ionicons } from '@expo/vector-icons'

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
    const pendingRequests = friendRequests || []

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <View style={[styles.content, { padding: theme.spacing[5] }]}>
                    {/* Friend Requests Section */}
                    {pendingRequests.length > 0 && (
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
                                        <View
                                            style={[
                                                styles.friendItem,
                                                { justifyContent: 'space-between' }
                                            ]}
                                        >
                                            <View style={[styles.friendInfo, { flex: 1 }]}>
                                                <Avatar
                                                    size="md"
                                                    fallback={otherUserId[0].toUpperCase()}
                                                />
                                                <View style={{ marginLeft: theme.spacing[3] }}>
                                                    <Text variant="default" size="md" weight="semibold">
                                                        {otherUserId.slice(0, 8)}...
                                                    </Text>
                                                    <Text variant="secondary" size="sm">
                                                        {isRequester ? 'Sent' : 'Received'}
                                                    </Text>
                                                </View>
                                            </View>
                                            {!isRequester && (
                                                <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
                                                    <Button
                                                        title="Accept"
                                                        onPress={async () => {
                                                            await acceptRequest({ friendId: request._id })
                                                        }}
                                                        variant="default"
                                                        size="sm"
                                                    />
                                                    <Button
                                                        title="Decline"
                                                        onPress={async () => {
                                                            await removeFriend({ friendId: request._id })
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
                    )}

                    {/* Friends List */}
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
                            <Ionicons
                                name="people-outline"
                                size={64}
                                color={theme.colors.textTertiary}
                            />
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
                                    <Card
                                        elevation="sm"
                                        padding="md"
                                        style={{ marginBottom: theme.spacing[2] }}
                                    >
                                        <View
                                            style={[
                                                styles.friendItem,
                                                { justifyContent: 'space-between' }
                                            ]}
                                        >
                                            <View style={[styles.friendInfo, { flex: 1 }]}>
                                                <Avatar
                                                    size="md"
                                                    fallback={otherUserId[0].toUpperCase()}
                                                />
                                                <View style={{ marginLeft: theme.spacing[3] }}>
                                                    <Text variant="default" size="md" weight="semibold">
                                                        {otherUserId.slice(0, 8)}...
                                                    </Text>
                                                    <Badge variant="secondary" size="sm">
                                                        Friend
                                                    </Badge>
                                                </View>
                                            </View>
                                            <Pressable
                                                onPress={async () => {
                                                    await removeFriend({ friendId: item._id })
                                                }}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={20}
                                                    color={theme.colors.error}
                                                />
                                            </Pressable>
                                        </View>
                                    </Card>
                                )
                            }}
                            keyExtractor={(item) => item._id}
                            estimatedItemSize={80}
                            contentContainerStyle={{ paddingBottom: theme.spacing[5] }}
                        />
                    )}
                </View>
            )}
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
    emptyStateSubtext: {}
})

