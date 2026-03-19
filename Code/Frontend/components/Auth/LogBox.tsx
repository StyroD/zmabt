import { StyleSheet, View, Text, TextInput, Touchable, TouchableOpacity}  from "react-native";
import { Colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    placeholder: string
    label: string
    value: string
    onChangeText: (text: string) => void
    secureTextEntry?: boolean
    icon ?: string
}

export function LogBox({ placeholder, label, value, onChangeText, secureTextEntry = false, icon = undefined }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                />
{icon && <Ionicons style={{ marginLeft: 'auto' }} name={icon as any} size={20} color={Colors.primary} />}
                </View>
        </View>
    )
}

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
    inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
},
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
    },
});