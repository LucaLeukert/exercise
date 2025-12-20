import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Redirect, Stack } from 'expo-router'
import AppleSignIn from '@/components/auth/AppleSignIn'
import { Authenticated, Unauthenticated } from 'convex/react'

export default function AuthPage() {
    return (
        <>
            <Unauthenticated>
                <ScrollView style={styles.container}>
                    <Stack.Screen
                        options={{
                            title: 'Welcome',
                            headerShown: false
                        }}
                    />
                    <View style={styles.content}>
                        <View style={styles.heroSection}>
                            <Text style={styles.logo}>🏋️</Text>
                            <Text style={styles.title}>Fitness Tracker</Text>
                            <Text style={styles.tagline}>
                                Track your progress, achieve your goals
                            </Text>
                        </View>

                        <View style={styles.ctaSection}>
                            <Text style={styles.ctaTitle}>Get Started</Text>
                            <Text style={styles.ctaDescription}>
                                Sign in with your Apple ID to begin tracking
                            </Text>
                            <View style={styles.signInContainer}>
                                <AppleSignIn />
                            </View>
                        </View>

                        <View style={styles.featuresSection}>
                            <View style={styles.featureCard}>
                                <Text style={styles.featureIcon}>💪</Text>
                                <Text style={styles.featureTitle}>Track Workouts</Text>
                                <Text style={styles.featureDescription}>
                                    Log exercises and monitor your training
                                </Text>
                            </View>

                            <View style={styles.featureCard}>
                                <Text style={styles.featureIcon}>📊</Text>
                                <Text style={styles.featureTitle}>View Progress</Text>
                                <Text style={styles.featureDescription}>
                                    Visualize improvements over time
                                </Text>
                            </View>

                            <View style={styles.featureCard}>
                                <Text style={styles.featureIcon}>🎯</Text>
                                <Text style={styles.featureTitle}>Set Goals</Text>
                                <Text style={styles.featureDescription}>
                                    Define targets and stay motivated
                                </Text>
                            </View>

                            <View style={styles.featureCard}>
                                <Text style={styles.featureIcon}>📈</Text>
                                <Text style={styles.featureTitle}>Analytics</Text>
                                <Text style={styles.featureDescription}>
                                    Deep insights into your fitness journey
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.footer}>Your data is secure and private</Text>
                    </View>
                </ScrollView>
            </Unauthenticated>
            <Authenticated>
                <Redirect href="/(home)" />
            </Authenticated>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 32
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 48,
        paddingTop: 16
    },
    logo: {
        fontSize: 60,
        marginBottom: 16
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center'
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22
    },
    featuresSection: {
        marginBottom: 40,
        gap: 12
    },
    featureCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 8
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 12
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4
    },
    featureDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18
    },
    ctaSection: {
        marginBottom: 32
    },
    ctaTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center'
    },
    ctaDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20
    },
    signInContainer: {
        marginBottom: 0
    },
    footer: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 16
    }
})
