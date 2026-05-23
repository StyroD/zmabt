import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native"
import { useColors } from "@/contexts/ThemeContext"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef, useEffect } from "react"
import { SafeAreaView } from 'react-native-safe-area-context'
import { getMessages, postMessage } from "@/api/endpoints/messages"
import { getSocket } from "@/api/socket"
import * as SecureStore from "expo-secure-store"
import type { Socket } from "socket.io-client"
import { cacheMessages, getCachedMessages, appendMessage } from '@/utils/db'
import { unreadSignal } from "@/utils/unreadSignal"
import { activeChatSignal } from "@/utils/activeChatSignal"
import NetInfo from "@react-native-community/netinfo"

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  sent_at: string
  _error?: boolean
}

export default function ChatDetail() {
  const Colors = useColors()
  const { userId, name } = useLocalSearchParams<{ userId: string; name: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const currentUserIdRef = useRef('')
  const listRef = useRef<FlatList>(null)
  const socketRef = useRef<Socket | null>(null)

  const initials = name?.split(' ').map(n => n[0]).join('') ?? '?'

  useEffect(() => {
    activeChatSignal.set(userId)
    unreadSignal.set(0)
    return () => activeChatSignal.set('')
  }, [userId])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let mounted = true

    const handleNewMessage = (msg: Message) => {
      if (!mounted) return
      if (msg.sender_id === currentUserIdRef.current) return
      if (msg.sender_id !== userId) return
      appendMessage(msg)
      setMessages(prev => [...prev, msg])
    }

    const setup = async () => {
      try {
        const [uid, socket] = await Promise.all([
          SecureStore.getItemAsync('userId'),
          getSocket(),
        ])

        if (!mounted) return

        currentUserIdRef.current = uid ?? ''
        setCurrentUserId(uid ?? '')
        socketRef.current = socket

        socket.on('new_message', handleNewMessage)

        try {
          const res = await getMessages(userId)
          if (!mounted) return
          setMessages(res.data)
          await cacheMessages(uid ?? '', userId, res.data)
        } catch {
          const cached = await getCachedMessages(uid ?? '', userId)
          if (!mounted) return
          setMessages(cached)
        } finally {
          if (mounted) setLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (mounted) setLoading(false)
      }
    }

    setup()

    return () => {
      mounted = false
      socketRef.current?.off('new_message', handleNewMessage)
    }
  }, [userId])

  const showSendError = () => {
    const errMsg: Message = {
      id: `err-${Date.now()}`,
      sender_id: '__error__',
      receiver_id: userId,
      content: 'Internet unavailable. Please try again later.',
      sent_at: new Date().toISOString(),
      _error: true,
    }
    setMessages(prev => [...prev, errMsg])
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    if (!isOnline) {
      showSendError()
      return
    }

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      sender_id: currentUserIdRef.current,
      receiver_id: userId,
      content: text,
      sent_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, optimistic])
    setInput('')

    postMessage(userId, text)
      .then(res => {
        appendMessage(res.data)
        setMessages(prev =>
          prev.map(m => (m.id === optimistic.id ? res.data : m))
        )
      })
      .catch(() => {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
        showSendError()
      })
  }

  const styles = StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backButton: {
      width: 40,
      alignItems: 'flex-start',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: Colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    userName: {
      color: Colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginHorizontal: 16,
    },
    offlineBanner: {
      backgroundColor: Colors.dangerBg,
      borderBottomWidth: 1,
      borderBottomColor: Colors.dangerBorder,
      paddingVertical: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    offlineBannerText: {
      fontSize: 13,
      color: Colors.danger,
      flex: 1,
    },
    messagesList: {
      padding: 16,
      gap: 8,
    },
    messageRow: {
      flexDirection: 'row',
      marginVertical: 4,
    },
    messageRowOwn: {
      justifyContent: 'flex-end',
    },
    messageRowOther: {
      justifyContent: 'flex-start',
    },
    bubble: {
      maxWidth: '75%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
    },
    bubbleOwn: {
      backgroundColor: Colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleOther: {
      backgroundColor: Colors.surfaceElevated,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 14,
    },
    messageTextOwn: {
      color: '#fff',
    },
    messageTextOther: {
      color: Colors.textPrimary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    input: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: Colors.textPrimary,
      fontSize: 14,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    inputDisabled: {
      opacity: 0.5,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
    errorRow: {
      alignItems: 'center',
      marginVertical: 6,
    },
    errorText: {
      fontSize: 12,
      color: Colors.danger,
      backgroundColor: Colors.dangerBg,
      borderWidth: 1,
      borderColor: Colors.dangerBorder,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      overflow: 'hidden',
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={25}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.userName}>{name}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.divider} />

        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color={Colors.danger} />
            <Text style={styles.offlineBannerText}>
              No internet connection. Please try again later.
            </Text>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={[...messages].reverse()}
          inverted
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            if (item._error) {
              return (
                <View style={styles.errorRow}>
                  <Text style={styles.errorText}>{item.content}</Text>
                </View>
              )
            }
            const isOwn = item.sender_id === currentUserId
            return (
              <View style={[styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther]}>
                <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                  <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : styles.messageTextOther]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )
          }}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputRow}>
          <TextInput
            testID="message-input"
            style={[styles.input, !isOnline && styles.inputDisabled]}
            value={input}
            onChangeText={setInput}
            placeholder={isOnline ? "Message..." : "Unavailable offline"}
            placeholderTextColor={Colors.textSecondary}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={isOnline}
          />
          <TouchableOpacity
            testID="send-button"
            style={[styles.sendButton, !isOnline && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!isOnline}
          >
            <Ionicons name="send" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}