import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/color";
import { LogBox } from "@/components/Auth/LogBox";
import { ProfileBox } from "@/components/Dashboard/ProfileBox";
import { useState } from 'react';
import { Redirect, router, useRouter } from "expo-router";
import { ScreenWrapper } from '@/components/ScreenWrapper';
import * as SecureStore from 'expo-secure-store'
import { login } from "@/api/auth";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const route = useRouter();
    const [logError, setLogError] = useState('');



    const handleLogin = async () => {
    try {
        const data = await login(email, password)
        await SecureStore.setItemAsync('token', data.token)
        await SecureStore.setItemAsync('userId', data.user.id)
        router.push('/tabs/dashboard')
    } catch (e: any) {
    if (e.response) {
        // server responded with an error
        if (e.response.status === 401) {
            setLogError('Invalid email or password')
        } else {
            setLogError('Something went wrong')
        }
    } else {
        // network error
        setLogError('Something went wrong')
    }
}
}
    return (
        <ScreenWrapper title="Login">
        <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <LogBox placeholder="Enter your email" label="Email" value={email} onChangeText={(text) => setEmail(text)} />
            <LogBox placeholder="Enter your password" label="Password" value={password} onChangeText={(text) => setPassword(text)} secureTextEntry={true} icon="eye-off" />
             <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => { router.push('/auth/sign')}}>
                <Text style={styles.link}>Dont have an account?</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            {logError ? <Text style={styles.error}>{logError}</Text> : null}
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
    error: {
    color: Colors.danger,
    fontSize: 14,
    textAlign: 'center',
    },
});
