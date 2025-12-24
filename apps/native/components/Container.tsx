import { SafeAreaView } from 'react-native'
import { useTheme } from '@/ui'

export const Container = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useTheme()

    return (
        <SafeAreaView
            style={{
                flex: 1,
                padding: theme.spacing[6],
                backgroundColor: theme.colors.background
            }}
        >
            {children}
        </SafeAreaView>
    )
}
