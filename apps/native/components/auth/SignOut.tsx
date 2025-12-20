import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { fromThrowable } from '@/utils/result'
import { useClerk } from '@clerk/clerk-expo'

export const SignOutButton = () => {
    // Use `useClerk()` to access the `signOut()` function
    const { signOut } = useClerk()
    const router = useRouter()

    const handleSignOut = async () => {
        const result = await fromThrowable(
            () => signOut(),
            (error) => ({
                type: 'signout_error' as const,
                message: 'Failed to sign out',
                originalError: error
            })
        )

        result.match(
            () => {
                // Redirect to your desired page
                router.replace('/(auth)')
            },
            (err) => {
                // See https://clerk.com/docs/guides/development/custom-flows/error-handling
                // for more info on error handling
                console.error('Sign out error:', JSON.stringify(err, null, 2))
            }
        )
    }

    return (
        <TouchableOpacity onPress={handleSignOut}>
            <Text>Sign out</Text>
        </TouchableOpacity>
    )
}
