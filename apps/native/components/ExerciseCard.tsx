import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Badge, Card, useTheme } from '@/ui'
import { Ionicons } from '@expo/vector-icons'
import { ExerciseType } from '@packages/backend/convex/schema'

interface ExerciseCardProps {
    exercise: ExerciseType
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
    const router = useRouter()
    const { theme } = useTheme()

    const levelVariantMap: Record<
        string,
        'primary' | 'secondary' | 'success' | 'warning' | 'outline'
    > = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'primary',
        expert: 'primary'
    }

    const levelVariant = levelVariantMap[exercise.level.toLowerCase()] || 'secondary'

    return (
        <Pressable onPress={() => router.push(`/exercise/${exercise.externalId}`)}>
            <Card
                elevation="md"
                padding="md"
                style={[styles.card, { marginBottom: theme.spacing[3] }]}
            >
                <View style={styles.exerciseContent}>
                    <View style={styles.exerciseInfo}>
                        <Text
                            style={[
                                styles.exerciseName,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.xl,
                                    fontWeight: theme.fontWeights.bold,
                                    lineHeight: theme.fontSizes.xl * 1.33
                                }
                            ]}
                            numberOfLines={2}
                        >
                            {exercise.name}
                        </Text>
                        <View style={[styles.metaInfo, { gap: theme.spacing[2] }]}>
                            <Badge variant="secondary" size="sm">
                                {exercise.category}
                            </Badge>
                            <Badge variant={levelVariant} size="sm">
                                {exercise.level}
                            </Badge>
                        </View>
                    </View>
                    <View style={[styles.muscleInfo, { gap: theme.spacing[1] }]}>
                        <Text
                            style={[
                                styles.muscleLabel,
                                {
                                    color: theme.colors.textTertiary,
                                    fontSize: theme.fontSizes.xs,
                                    fontWeight: theme.fontWeights.medium
                                }
                            ]}
                        >
                            PRIMARY
                        </Text>
                        <Text
                            style={[
                                styles.muscleText,
                                {
                                    color: theme.colors.textSecondary,
                                    fontSize: theme.fontSizes.sm
                                }
                            ]}
                            numberOfLines={2}
                        >
                            {exercise.primaryMuscles.slice(0, 2).join(', ')}
                            {exercise.primaryMuscles.length > 2 &&
                                ` +${exercise.primaryMuscles.length - 2}`}
                        </Text>
                    </View>
                </View>
                <View style={styles.arrowIcon}>
                    <Ionicons name="chevron-forward" size={24} color={theme.colors.textTertiary} />
                </View>
            </Card>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    exerciseContent: {
        flex: 1,
        gap: 12
    },
    exerciseInfo: {
        gap: 8
    },
    exerciseName: {},
    metaInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    muscleInfo: {},
    muscleLabel: {
        textTransform: 'uppercase'
    },
    muscleText: {
        textTransform: 'capitalize'
    },
    arrowIcon: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8
    }
})
