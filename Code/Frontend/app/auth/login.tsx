import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/color";
import { LogBox } from "@/components/Auth/LogBox";
import { ProfileBox } from "@/components/Dashboard/ProfileBox";

export default function Login() {
    return (
        <View style={styles.container}>
        <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <LogBox placeholder="Enter your email" label="Email" value="" onChangeText={() => {}} />
            <LogBox placeholder="Enter your password" label="Password" value="" onChangeText={() => {}} secureTextEntry={true} icon="eye-off" />
             <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => {}}>
                <Text style={styles.link}>Don't have an account?</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => {}}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 24,
    },
    card: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: Colors.surface,
        fontWeight: '600',
        fontSize: 16,
    },
    link: {
        color: Colors.primary,
        textAlign: 'center',
        fontSize: 14,
    },
});