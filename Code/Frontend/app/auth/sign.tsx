import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/color";
import { LogBox } from "@/components/Auth/LogBox";
import { useState } from 'react';
import { Redirect, router} from "expo-router";
import { ScreenWrapper} from '@/components/ScreenWrapper';

export default function Sign() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    return (
        <ScreenWrapper title="SignUp">
        <View style={styles.card}>
            <Text style={styles.title}>Sign Up</Text>
            <LogBox placeholder="Enter your email" label="Email" value={email} onChangeText={(text) => setEmail(text)} />
            <LogBox placeholder="Enter your password" label="Password" value={password} onChangeText={(text) => setPassword(text)} secureTextEntry={true} icon="eye-off" />
            <LogBox placeholder="Confirm your password" label="Confirm Password" value={confirmPassword} onChangeText={(text) => setConfirmPassword(text)} secureTextEntry={true} icon="eye-off" />
             <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => { router.push('/auth/login')}}>
                <Text style={styles.link}>Already have an account?</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => {}}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            </View>
        </ScreenWrapper>
    )

}



const styles = StyleSheet.create({
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