import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native"
import { Colors } from "@/constants/color"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef, useEffect } from "react"
import { SafeAreaView } from 'react-native-safe-area-context'
import { getMessages, postMessage } from "@/api/endpoints/messages"
import { getSocket } from "@/api/socket"
import * as SecureStore from "expo-secure-store"
import type { Socket } from "socket.io-client"

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  sent_at: string
}

export default function ChatDetail() {
  const { userId, name } = useLocalSearchParams<{ userId: string; name: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('')
  const currentUserIdRef = useRef('')
  const listRef = useRef<FlatList>(null)
  const socketRef = useRef<Socket | null>(null)

  const initials = name?.split(' ').map(n => n[0]).join('') ?? '?'

  useEffect(() => {
    let mounted = true

    const setup = async () => {
      try {
        const [uid, messagesRes, socket] = await Promise.all([
          SecureStore.getItemAsync('userId'),
          getMessages(userId),
          getSocket(),
        ])

        if (!mounted) return

        currentUserIdRef.current = uid ?? ''
        setCurrentUserId(uid ?? '')
        setMessages(messagesRes.data)
        socketRef.current = socket

        // Only handle incoming messages from the other person.
        // Own messages are added optimistically in sendMessage.
        socket.on('new_message', (msg: Message) => {
          if (!mounted) return
          if (msg.sender_id === currentUserIdRef.current) return
          if (msg.sender_id !== userId) return
          setMessages(prev => [...prev, msg])
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
        })
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    setup()

    return () => {
      mounted = false
      socketRef.current?.off('new_message')
    }
  }, [userId])

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return

    // Add optimistically so it appears immediately
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      sender_id: currentUserIdRef.current,
      receiver_id: userId,
      content: text,
      sent_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    scrollToBottom()

    // Save to DB via REST — this is what makes it persist and show in conversations
    postMessage(userId, text).catch(err => console.error('Failed to send:', err))
  }

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

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
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
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Message..."
            placeholderTextColor={Colors.textSecondary}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
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
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
