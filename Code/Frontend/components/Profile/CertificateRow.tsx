import { Colors } from "@/constants/color"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {View, Text, StyleSheet, TouchableOpacity} from "react-native"

type Props = {
    name: string,
    certified: boolean,
    onShow: () => void
}

export function CertificateRow({name, certified, onShow} : Props){
    const iconName = certified ? "checkmark-circle" : "close-circle"
    const iconColor = certified ? Colors.success : Colors.danger
    return(
    <View style={styles.container}>
        <Text style={[styles.otherText, styles.name]}>{name}</Text>
        <View style={styles.icon}>
            <Ionicons name={iconName} color={iconColor} size={20} />
        </View>
        <View style={styles.show}>
            <TouchableOpacity onPress={onShow}>
                <Text style={styles.showText}>Show</Text>
            </TouchableOpacity>
        </View>
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
            fontSize : 16,
        },
    otherText: {
            color: Colors.textSecondary,
            fontSize : 16,
        },
    
    }
    
)