import { View, Text, StyleSheet } from "react-native"
import { useColors } from '@/contexts/ThemeContext'

type Props = {
    label: string
    value: string | number | null | undefined
}

export function ProfileField({ label, value }: Props) {
    const Colors = useColors()
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            gap: 4,
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: Colors.textSecondary,
        },
        field: {
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: Colors.surface,
        },
        value: {
            fontSize: 16,
            color: Colors.textPrimary,
        },
    })
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.field}>
                <Text style={styles.value} numberOfLines={2}>{value ?? '—'}</Text>
            </View>
        </View>
    )
}
