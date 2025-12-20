import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { ExerciseType } from '@packages/backend/convex/schema'

interface ExerciseCardProps {
    exercise: ExerciseType
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
    const router = useRouter()

    return (
        <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => router.push(`/exercise/${exercise.externalId}`)}
            activeOpacity={0.7}
        >
            <View style={styles.exerciseContent}>
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName} numberOfLines={2}>
                        {exercise.name}
                    </Text>
                    <View style={styles.metaInfo}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{exercise.category}</Text>
                        </View>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{exercise.level}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.muscleInfo}>
                    <Text style={styles.muscleLabel}>Primary</Text>
                    <Text style={styles.muscleText} numberOfLines={2}>
                        {exercise.primaryMuscles.slice(0, 2).join(', ')}
                        {exercise.primaryMuscles.length > 2 &&
                            ` +${exercise.primaryMuscles.length - 2}`}
                    </Text>
                </View>
            </View>
            <View style={styles.arrowIcon}>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    exerciseCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3
    },
    exerciseContent: {
        flex: 1,
        gap: 12
    },
    exerciseInfo: {
        gap: 8
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        lineHeight: 24
    },
    metaInfo: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap'
    },
    categoryBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    categoryText: {
        color: '#1976d2',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    levelBadge: {
        backgroundColor: '#f3e5f5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    levelText: {
        color: '#7b1fa2',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    muscleInfo: {
        gap: 4
    },
    muscleLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    muscleText: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize'
    },
    arrowIcon: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8
    },
    arrowText: {
        fontSize: 32,
        color: '#ccc',
        fontWeight: '300'
    }
})
