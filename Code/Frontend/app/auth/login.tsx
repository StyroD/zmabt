import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/color";
import { LogBox } from "@/components/Auth/LogBox";
import { useState } from 'react';
import { router } from "expo-router";
import { ScreenWrapper } from '@/components/ScreenWrapper';
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import { login } from "@/api/auth";
import client from "@/api/client";

WebBrowser.maybeCompleteAuthSession()

const GOOGLE_BASE = 'https://blasphemy-wrongness-letdown.ngrok-free.dev'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [logError, setLogError] = useState('');

    const handleLogin = async () => {
        try {
            const data = await login(email, password)
            await SecureStore.setItemAsync('token', data.token)
            await SecureStore.setItemAsync('user', JSON.stringify(data.user))
            router.push('/tabs/dashboard')
        } catch (e: any) {
            if (e.response?.status === 401) {
                setLogError('Invalid email or password')
            } else {
                setLogError('Something went wrong')
            }
        }
    }

    const handleGoogleLogin = async () => {
        setLogError('')
        const result = await WebBrowser.openAuthSessionAsync(
            `${GOOGLE_BASE}/auth/google`,
            'frontend://auth'
        )
        if (result.type !== 'success') return

        const url = result.url
        const token = url.match(/[?&]token=([^&]+)/)?.[1]
        if (!token) {
            setLogError('Google sign-in failed')
            return
        }

        try {
            await SecureStore.setItemAsync('token', token)
            const res = await client.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            await SecureStore.setItemAsync('user', JSON.stringify(res.data))
            router.replace('/tabs/dashboard')
        } catch {
            setLogError('Could not load user after Google sign-in')
        }
    }

    return (
        <ScreenWrapper title="Login">
            <View style={styles.card}>
                <Text style={styles.title}>Login</Text>
                <LogBox placeholder="Enter your email" label="Email" value={email} onChangeText={setEmail} />
                <LogBox placeholder="Enter your password" label="Password" value={password} onChangeText={setPassword} secureTextEntry={true} icon="eye-off" />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity onPress={() => router.push('/auth/sign')}>
                        <Text style={styles.link}>Dont have an account?</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
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
    googleButton: {
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    googleButtonText: {
        color: Colors.textPrimary,
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
