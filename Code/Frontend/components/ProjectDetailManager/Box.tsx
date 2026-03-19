import { Colors } from "@/constants/color";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
import { useState } from 'react';


type Props = {
    placeholder?: string
    text: string
    width: 'small' | 'big'
}

export function Box(props: Props) {

    return (
        <View style={[styles.container, props.width === 'small' ? styles.small : styles.big]}>
            <Text style={styles.placeholder}>{props.placeholder}</Text>

            <Text
                style={styles.text}
                numberOfLines={1}
                ellipsizeMode="tail"
                onLongPress={() => alert(props.text)}
            >
                {props.text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        gap: 4,
    },
    small: {
        width: '48%',
        minHeight: 65,
        alignSelf: 'flex-start',
    },
    big: {
        alignSelf: 'stretch',
        minHeight: 65,
    },
    placeholder: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    text: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textPrimary,
    }
})