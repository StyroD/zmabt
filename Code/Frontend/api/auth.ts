import client from "./client"
import * as SecureStore from 'expo-secure-store'

export const login = async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password })
    const { token, user } = response.data
    await SecureStore.setItemAsync('token', token)
    await SecureStore.setItemAsync('userId', user.id)
    return response.data
}

export const register = async (email: string, password: string) => {
    const response = await client.post('/auth/register', { email, password })
    return response.data
}

export const getMe = () => client.get('/auth/me')

export const logout = async () => {
    await SecureStore.deleteItemAsync('token')
    await SecureStore.deleteItemAsync('userId')
}