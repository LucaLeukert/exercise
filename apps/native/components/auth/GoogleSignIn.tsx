import * as React from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { Button } from '@/ui'
import { fromThrowable } from '@/utils/result'
import { useSSO } from '@clerk/clerk-expo'
import Ionicons from '@expo/vector-icons/Ionicons'

// Required for OAuth flow
WebBrowser.maybeCompleteAuthSession()

export default function GoogleSignIn() {
    const { startSSOFlow } = useSSO()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const onPress = async () => {
        setIsLoading(true)
        try {
            const result = await fromThrowable(
                () => startSSOFlow({ strategy: 'oauth_google' }),
                (error) => ({
                    type: 'oauth_error' as const,
                    message: 'Failed to start OAuth flow',
                    originalError: error
                })
            )

            if (result.isErr()) {
                console.error('OAuth error:', JSON.stringify(result.error, null, 2))
                return
            }

            const { createdSessionId, signIn, signUp, setActive } = result.value

            if (createdSessionId) {
                // Session was created successfully
                if (!setActive) {
                    console.error('setActive is not available')
                    return
                }

                try {
                    const setActiveResult = await fromThrowable(
                        () => setActive({ session: createdSessionId }),
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
                } catch (error) {
                    console.error('Unexpected error setting active session:', error)
                }
            } else {
                // Use signIn or signUp for next steps such as MFA
                console.log('Additional steps required:', { signIn, signUp })
                
                // Show user-facing alert explaining next steps
                Alert.alert(
                    'Additional Steps Required',
                    'Your sign-in requires additional verification. Please complete the authentication process in the browser window.',
                    [
                        {
                            text: 'OK',
                            style: 'default'
                        }
                    ],
                    { cancelable: true }
                )
            }
        } catch (error) {
            console.error('Unexpected error in OAuth flow:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            title="Sign in with Google"
            onPress={onPress}
            disabled={isLoading}
            loading={isLoading}
            leftIcon={<Ionicons name="logo-google" size={20} color="#fff" />}
            variant="primary"
            fullWidth
        />
    )
}
