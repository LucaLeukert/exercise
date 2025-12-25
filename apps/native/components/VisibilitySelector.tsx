import { View } from 'react-native'
import { Button, Card, Text as UIText, useTheme } from '@/ui'
import { Ionicons } from '@expo/vector-icons'

type VisibilitySelectorProps = {
    value: 'private' | 'friends' | 'public'
    onChange: (value: 'private' | 'friends' | 'public') => void
}

export function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
    const { theme } = useTheme()

    return (
        <Card elevation="sm" padding="md" style={{ width: '100%', marginBottom: theme.spacing[6] }}>
            <UIText
                variant="secondary"
                size="sm"
                weight="semibold"
                style={{ marginBottom: theme.spacing[3] }}
            >
                Visibility
            </UIText>
            <View style={{ gap: theme.spacing[2] }}>
                <Button
                    title="Private"
                    onPress={() => onChange('private')}
                    variant={value === 'private' ? 'primary' : 'outline'}
                    fullWidth
                    size="sm"
                    leftIcon={
                        <Ionicons
                            name="lock-closed"
                            size={16}
                            color={
                                value === 'private'
                                    ? theme.colors.primaryForeground
                                    : theme.colors.primary
                            }
                        />
                    }
                />
                <Button
                    title="Friends Only"
                    onPress={() => onChange('friends')}
                    variant={value === 'friends' ? 'primary' : 'outline'}
                    fullWidth
                    size="sm"
                    leftIcon={
                        <Ionicons
                            name="people"
                            size={16}
                            color={
                                value === 'friends'
                                    ? theme.colors.primaryForeground
                                    : theme.colors.primary
                            }
                        />
                    }
                />
                <Button
                    title="Public"
                    onPress={() => onChange('public')}
                    variant={value === 'public' ? 'primary' : 'outline'}
                    fullWidth
                    size="sm"
                    leftIcon={
                        <Ionicons
                            name="globe"
                            size={16}
                            color={
                                value === 'public'
                                    ? theme.colors.primaryForeground
                                    : theme.colors.primary
                            }
                        />
                    }
                />
            </View>
        </Card>
    )
}

