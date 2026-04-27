import { View, StyleSheet, Text } from "react-native"
import { useColors } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"

type Props = {
    name: string
    role: boolean
    status: string
}

export function ProfileBox({ name, role, status }: Props) {
    const Colors = useColors()
    const styles = StyleSheet.create({
        container: {
            backgroundColor: Colors.surface,
            marginHorizontal: 10,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            gap: 16,
        },
        info: {
            flex: 1,
        },
        name: {
            fontSize: 18,
            fontWeight: '500',
            color: Colors.textPrimary,
        },
        row: {
            flexDirection: 'row',
            gap: 16,
            marginTop: 4,
        },
        role: {
            fontSize: 14,
            color: Colors.textSecondary,
        },
        status: {
            fontSize: 14,
            color: Colors.success,
        },
    })
    return (
        <View style={styles.container}>
            <Ionicons name="person" size={50} color={Colors.primary} />
            <View style={styles.info}>
                <Text style={styles.name}>{name}</Text>
                <View style={styles.row}>
                    <Text style={styles.role}>{role ? 'Manager' : 'Worker'}</Text>
                    <Text style={styles.status}>{status}</Text>
                </View>
            </View>
        </View>
    )
}
