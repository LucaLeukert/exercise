import * as React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
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
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startSSOFlow({
                strategy: 'oauth_apple'
            })

            if (createdSessionId) {
                // Session was created successfully
                await setActive!({ session: createdSessionId })
                router.replace('/(home)')
            } else {
                // Use signIn or signUp for next steps such as MFA
                console.log('Additional steps required:', { signIn, signUp })
            }
        } catch (err) {
            console.error('OAuth error:', JSON.stringify(err, null, 2))
        } finally {
            setIsLoading(false)
        }
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
