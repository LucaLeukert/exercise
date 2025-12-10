import React from 'react'
import { Redirect } from 'expo-router'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'

export default function index() {
    return (
        <>
            <SignedIn>
                <Redirect href="/(home)" />
            </SignedIn>
            <SignedOut>
                <Redirect href="/(auth)" />
            </SignedOut>
        </>
    )
}
