import { Colors } from "@/constants/color"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

type Props = {
    name: string,
    certified: boolean,
    onShow: () => void
}

export function CertificateRow({ name, certified, onShow }: Props) {
    const iconName = certified ? "checkmark-circle" : "close-circle"
    const iconColor = certified ? Colors.success : Colors.danger
    return (
        <View style={styles.container}>
            <Text style={[styles.otherText, styles.name]}>{name}</Text>
            <Ionicons name={iconName} color={iconColor} size={20} />
            <TouchableOpacity onPress={onShow} style={styles.showBtn}>
                <Text style={styles.showText}>Show</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
        </View>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
        },
        name: {
            flex: 1,
        },
        icon: {
            width: '35%',
            alignItems: 'center',
        },
        show: {
            width: '25%',
            alignItems: 'flex-end',
        },
        showText: {
            color: Colors.textSecondary,
            textDecorationLine: 'underline',
            fontSize: 16,
        },
        otherText: {
            color: Colors.textSecondary,
            fontSize: 16,
        },
        divider: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: Colors.border,
        },
        showBtn: {
            width: '25%',
            alignItems: 'flex-end',
        },

    }

)