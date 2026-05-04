import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { LogBox } from '@/components/Auth/LogBox'
import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import * as SecureStore from 'expo-secure-store'
import { registerWithInvite } from '@/api/endpoints/invite'
import { saveUser } from '@/utils/secureUser'

export default function RegisterInvite() {
  const Colors = useColors()
  const { token: paramToken } = useLocalSearchParams<{ token?: string }>()

  const [token, setToken] = useState(paramToken ?? '')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')
    if (!token.trim()) { setError('Invite token is required'); return }
    if (!firstName.trim() || !lastName.trim()) { setError('First and last name are required'); return }
    if (!username.trim()) { setError('Username is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const res = await registerWithInvite({
        token: token.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      })
      const { token: jwt, user } = res.data
      await SecureStore.setItemAsync('token', jwt)
      await SecureStore.setItemAsync('userId', user.id)
      await saveUser(user)
      router.replace('/tabs/dashboard')
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Registration failed'
      if (msg.includes('Invalid or expired')) {
        setError('This invite link is invalid or has expired')
      } else if (e?.response?.status === 409) {
        setError('Username or email already taken')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
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
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginBottom: 4,
    },
    button: {
      backgroundColor: Colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      opacity: loading ? 0.6 : 1,
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
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginVertical: 4,
    },
  })

  return (
    <ScreenWrapper title="Register">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Enter the invite code shared by your manager</Text>

          <LogBox label="Invite code" placeholder="Paste invite token here" value={token} onChangeText={setToken} />

          <View style={styles.divider} />

          <LogBox label="First name" placeholder="Enter your first name" value={firstName} onChangeText={setFirstName} />
          <LogBox label="Last name" placeholder="Enter your last name" value={lastName} onChangeText={setLastName} />
          <LogBox label="Username" placeholder="Choose a username" value={username} onChangeText={setUsername} />
          <LogBox label="Phone" placeholder="Enter your phone number" value={phone} onChangeText={setPhone} />
          <LogBox label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} />
          <LogBox label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry icon="eye-off" />
          <LogBox label="Confirm password" placeholder="Repeat your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry icon="eye-off" />

          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create account'}</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}
