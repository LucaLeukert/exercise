import * as React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { fromThrowable } from '@/utils/result'
import { useSSO } from '@clerk/clerk-expo'
import Ionicons from '@expo/vector-icons/Ionicons'

// Required for OAuth flow
WebBrowser.maybeCompleteAuthSession()

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5
    }
})

export default function AppleSignIn() {
    const { startSSOFlow } = useSSO()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const onPress = async () => {
        setIsLoading(true)
        const result = await fromThrowable(
            () => startSSOFlow({ strategy: 'oauth_apple' }),
            (error) => ({
                type: 'oauth_error' as const,
                message: 'Failed to start OAuth flow',
                originalError: error
            })
        )

        result.match(
            async ({ createdSessionId, signIn, signUp, setActive }) => {
                if (createdSessionId) {
                    // Session was created successfully
                    const setActiveResult = await fromThrowable(
                        () => setActive!({ session: createdSessionId }),
                        (error) => ({
                            type: 'session_error' as const,
                            message: 'Failed to set active session',
                            originalError: error
                        })
                    )

                    setActiveResult.match(
                        () => {
                            router.replace('/(home)')
                        },
                        (err) => {
                            console.error('Set active session error:', JSON.stringify(err, null, 2))
                        }
                    )
                } else {
                    // Use signIn or signUp for next steps such as MFA
                    console.log('Additional steps required:', { signIn, signUp })
                }
            },
            (err) => {
                console.error('OAuth error:', JSON.stringify(err, null, 2))
            }
        )

        setIsLoading(false)
    }

    return (
        <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={onPress}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <>
                    <Ionicons name="logo-apple" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Sign in with Apple</Text>
                </>
            )}
        </Pressable>
    )
}
