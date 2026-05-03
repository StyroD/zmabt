import { useColors } from "@/contexts/ThemeContext"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

type Props = {
    name: string
    certified: boolean
    onShow: () => void
}

export function CertificateRow({ name, certified, onShow }: Props) {
    const Colors = useColors()

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
        },
        name: {
            flex: 1,
            fontSize: 16,
            color: Colors.textPrimary,
        },
        status: {
            fontSize: 13,
            color: certified ? Colors.success : Colors.danger,
            marginRight: 12,
        },
        showText: {
            color: Colors.primary,
            textDecorationLine: 'underline',
            fontSize: 14,
        },
        divider: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: Colors.border,
        },
    })

    return (
        <View style={styles.container}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.status}>{certified ? 'Accepted' : 'Pending'}</Text>
            <TouchableOpacity onPress={onShow}>
                <Text style={styles.showText}>Show</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
        </View>
    )
}