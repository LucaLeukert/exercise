import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Redirect, Stack } from 'expo-router'
import AppleSignIn from '@/components/auth/AppleSignIn'
import GoogleSignIn from '@/components/auth/GoogleSignIn'
import { Card, useTheme } from '@/ui'
import { Authenticated, Unauthenticated } from 'convex/react'

export default function AuthPage() {
    const { theme } = useTheme()

    return (
        <>
            <Unauthenticated>
                <ScrollView
                    style={[styles.container, { backgroundColor: theme.colors.background }]}
                >
                    <Stack.Screen
                        options={{
                            title: 'Welcome',
                            headerShown: false
                        }}
                    />
                    <View
                        style={[
                            styles.content,
                            {
                                paddingHorizontal: theme.spacing[5],
                                paddingVertical: theme.spacing[8]
                            }
                        ]}
                    >
                        <View
                            style={[
                                styles.heroSection,
                                {
                                    marginBottom: theme.spacing[12],
                                    paddingTop: theme.spacing[4]
                                }
                            ]}
                        >
                            <Text style={[styles.logo, { marginBottom: theme.spacing[4] }]}>
                                🏋️
                            </Text>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color: theme.colors.text,
                                        fontSize: theme.fontSizes['5xl'],
                                        fontWeight: theme.fontWeights.extrabold,
                                        marginBottom: theme.spacing[2]
                                    }
                                ]}
                            >
                                Fitness Tracker
                            </Text>
                            <Text
                                style={[
                                    styles.tagline,
                                    {
                                        color: theme.colors.textSecondary,
                                        fontSize: theme.fontSizes.md,
                                        lineHeight: theme.fontSizes.md * 1.4
                                    }
                                ]}
                            >
                                Track your progress, achieve your goals
                            </Text>
                        </View>

                        <View style={[styles.ctaSection, { marginBottom: theme.spacing[8] }]}>
                            <Text
                                style={[
                                    styles.ctaTitle,
                                    {
                                        color: theme.colors.text,
                                        fontSize: theme.fontSizes['2xl'],
                                        fontWeight: theme.fontWeights.bold,
                                        marginBottom: theme.spacing[2]
                                    }
                                ]}
                            >
                                Get Started
                            </Text>
                            <Text
                                style={[
                                    styles.ctaDescription,
                                    {
                                        color: theme.colors.textSecondary,
                                        fontSize: theme.fontSizes.sm,
                                        marginBottom: theme.spacing[6],
                                        lineHeight: theme.fontSizes.sm * 1.43
                                    }
                                ]}
                            >
                                Sign in to begin tracking your fitness journey
                            </Text>
                            <View style={[styles.signInContainer, { gap: theme.spacing[3] }]}>
                                <GoogleSignIn />
                                <AppleSignIn />
                            </View>
                        </View>

                        <View
                            style={[
                                styles.featuresSection,
                                { marginBottom: theme.spacing[10], gap: theme.spacing[3] }
                            ]}
                        >
                            <Card elevation="none" padding="md" style={{ backgroundColor: theme.colors.surfaceSecondary }}>
                                <Text
                                    style={[
                                        styles.featureIcon,
                                        { marginBottom: theme.spacing[3] }
                                    ]}
                                >
                                    💪
                                </Text>
                                <Text
                                    style={[
                                        styles.featureTitle,
                                        {
                                            color: theme.colors.text,
                                            fontSize: theme.fontSizes.md,
                                            fontWeight: theme.fontWeights.bold,
                                            marginBottom: theme.spacing[1]
                                        }
                                    ]}
                                >
                                    Track Workouts
                                </Text>
                                <Text
                                    style={[
                                        styles.featureDescription,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontSize: theme.fontSizes.sm,
                                            lineHeight: theme.fontSizes.sm * 1.38
                                        }
                                    ]}
                                >
                                    Log exercises and monitor your training
                                </Text>
                            </Card>

                            <Card elevation="none" padding="md" style={{ backgroundColor: theme.colors.surfaceSecondary }}>
                                <Text
                                    style={[
                                        styles.featureIcon,
                                        { marginBottom: theme.spacing[3] }
                                    ]}
                                >
                                    📊
                                </Text>
                                <Text
                                    style={[
                                        styles.featureTitle,
                                        {
                                            color: theme.colors.text,
                                            fontSize: theme.fontSizes.md,
                                            fontWeight: theme.fontWeights.bold,
                                            marginBottom: theme.spacing[1]
                                        }
                                    ]}
                                >
                                    View Progress
                                </Text>
                                <Text
                                    style={[
                                        styles.featureDescription,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontSize: theme.fontSizes.sm,
                                            lineHeight: theme.fontSizes.sm * 1.38
                                        }
                                    ]}
                                >
                                    Visualize improvements over time
                                </Text>
                            </Card>

                            <Card elevation="none" padding="md" style={{ backgroundColor: theme.colors.surfaceSecondary }}>
                                <Text
                                    style={[
                                        styles.featureIcon,
                                        { marginBottom: theme.spacing[3] }
                                    ]}
                                >
                                    🎯
                                </Text>
                                <Text
                                    style={[
                                        styles.featureTitle,
                                        {
                                            color: theme.colors.text,
                                            fontSize: theme.fontSizes.md,
                                            fontWeight: theme.fontWeights.bold,
                                            marginBottom: theme.spacing[1]
                                        }
                                    ]}
                                >
                                    Set Goals
                                </Text>
                                <Text
                                    style={[
                                        styles.featureDescription,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontSize: theme.fontSizes.sm,
                                            lineHeight: theme.fontSizes.sm * 1.38
                                        }
                                    ]}
                                >
                                    Define targets and stay motivated
                                </Text>
                            </Card>

                            <Card elevation="none" padding="md" style={{ backgroundColor: theme.colors.surfaceSecondary }}>
                                <Text
                                    style={[
                                        styles.featureIcon,
                                        { marginBottom: theme.spacing[3] }
                                    ]}
                                >
                                    📈
                                </Text>
                                <Text
                                    style={[
                                        styles.featureTitle,
                                        {
                                            color: theme.colors.text,
                                            fontSize: theme.fontSizes.md,
                                            fontWeight: theme.fontWeights.bold,
                                            marginBottom: theme.spacing[1]
                                        }
                                    ]}
                                >
                                    Analytics
                                </Text>
                                <Text
                                    style={[
                                        styles.featureDescription,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontSize: theme.fontSizes.sm,
                                            lineHeight: theme.fontSizes.sm * 1.38
                                        }
                                    ]}
                                >
                                    Deep insights into your fitness journey
                                </Text>
                            </Card>
                        </View>

                        <Text
                            style={[
                                styles.footer,
                                {
                                    color: theme.colors.textTertiary,
                                    fontSize: theme.fontSizes.xs,
                                    marginTop: theme.spacing[4]
                                }
                            ]}
                        >
                            Your data is secure and private
                        </Text>
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
        flex: 1
    },
    content: {},
    heroSection: {
        alignItems: 'center'
    },
    logo: {
        fontSize: 60
    },
    title: {
        textAlign: 'center'
    },
    tagline: {
        textAlign: 'center'
    },
    featuresSection: {},
    featureIcon: {
        fontSize: 32
    },
    featureTitle: {},
    featureDescription: {},
    ctaSection: {},
    ctaTitle: {
        textAlign: 'center'
    },
    ctaDescription: {
        textAlign: 'center'
    },
    signInContainer: {},
    footer: {
        textAlign: 'center'
    }
})
