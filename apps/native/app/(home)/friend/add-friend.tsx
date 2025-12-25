import { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { BackButton } from '@/components/BackButton'
import { Button, Card, Input, Text, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from 'convex/react'

export default function AddFriendPage() {
    const { user } = useUser()
    const { theme } = useTheme()
    const userId = user?.id || ''

    const [searchTerm, setSearchTerm] = useState('')
    const [isSending, setIsSending] = useState(false)

    const friends = useQuery(api.friends.getByUserId, { userId })
    const friendRequests = useQuery(api.friends.getRequests, { userId })
    const sendRequest = useMutation(api.friends.sendRequest)

    // Get received requests
    const receivedRequests = friendRequests || []
    // Get sent requests (pending where user is requester)
    const sentRequests =
        friends?.filter((f) => f.status === 'pending' && f.requesterId === userId) || []
    // Combine all pending requests
    const pendingRequests = [...receivedRequests, ...sentRequests]

    const handleSendRequest = async (recipientId: string) => {
        if (recipientId === userId) {
            Alert.alert('Error', 'Cannot send friend request to yourself')
            return
        }

        // Check if already friends
        const isAlreadyFriend = friends?.some(
            (f) =>
                (f.requesterId === userId && f.recipientId === recipientId) ||
                (f.requesterId === recipientId && f.recipientId === userId)
        )

        if (isAlreadyFriend) {
            Alert.alert('Error', 'You are already friends with this user')
            return
        }

        // Check if there's a pending request
        const hasPendingRequest = pendingRequests.some(
            (r) =>
                (r.requesterId === userId && r.recipientId === recipientId) ||
                (r.requesterId === recipientId && r.recipientId === userId)
        )

        if (hasPendingRequest) {
            Alert.alert('Error', 'There is already a pending friend request with this user')
            return
        }

        setIsSending(true)
        try {
            await sendRequest({ recipientId })
            Alert.alert('Success', 'Friend request sent!', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ])
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send friend request')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            edges={['bottom']}
        >
            <Stack.Screen
                options={{
                    title: 'Add Friend',
                    headerShown: true,
                    headerLeft: () => <BackButton />,
                    headerStyle: {
                        backgroundColor: theme.colors.surface
                    },
                    headerTintColor: theme.colors.text,
                    presentation: 'modal'
                }}
            />

            <View style={[styles.content, { padding: theme.spacing[5] }]}>
                <View style={{ marginBottom: theme.spacing[4] }}>
                    <Input
                        placeholder="Enter user ID or email..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        leftIcon={
                            <Ionicons
                                name="search-outline"
                                size={20}
                                color={theme.colors.textSecondary}
                            />
                        }
                        autoFocus
                    />
                </View>

                {searchTerm.trim().length === 0 ? (
                    <View
                        style={{
                            paddingVertical: theme.spacing[16],
                            alignItems: 'center'
                        }}
                    >
                        <Ionicons
                            name="search-outline"
                            size={64}
                            color={theme.colors.textTertiary}
                        />
                        <Text
                            variant="secondary"
                            size="md"
                            style={{
                                marginTop: theme.spacing[4],
                                color: theme.colors.textTertiary,
                                textAlign: 'center'
                            }}
                        >
                            Enter a user ID to add as a friend
                        </Text>
                    </View>
                ) : (
                    <View style={{ marginTop: theme.spacing[4] }}>
                        <Card elevation="sm" padding="md">
                            <View style={{ marginBottom: theme.spacing[4] }}>
                                <Text
                                    variant="default"
                                    size="md"
                                    weight="semibold"
                                    style={{ marginBottom: theme.spacing[2] }}
                                >
                                    Send friend request to:
                                </Text>
                                <Text variant="secondary" size="sm">
                                    {searchTerm}
                                </Text>
                            </View>
                            <Button
                                title={isSending ? 'Sending...' : 'Send Friend Request'}
                                onPress={() => handleSendRequest(searchTerm.trim())}
                                variant="primary"
                                fullWidth
                                disabled={isSending || searchTerm.trim() === userId}
                            />
                        </Card>
                    </View>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1
    }
})

