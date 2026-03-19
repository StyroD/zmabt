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
    const [expanded, setExpanded] = useState(false)

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
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        gap: 2,
    },
    small: {
        width: '48%',
        height: 65,
        alignSelf: 'flex-start',
    },
    big: {
        alignSelf: 'stretch',
        height: 65,
    },
    placeholder: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '400',
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
    }
})