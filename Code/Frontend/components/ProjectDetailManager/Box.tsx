import { Colors } from "@/constants/color";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";

type Props = {
    placeholder?: string
    text: string
    width: 'small' | 'big'

}

export function Box(props: Props) {
    return (
        <View style={[styles.container, props.width === 'small' ? styles.small : styles.big]}>
            <Text>Test</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
    },
    small: {
        flex: 1,
        height: 60
    },
    big: {
        alignSelf: 'stretch',
        height: 60
    }
})