import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native"
import { Colors } from "@/constants/color"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef } from "react"

type Message = {
  id: string
  senderId: string
  content: string
  timestamp: string
}

const CURRENT_USER_ID = 'me'

// Replace with real API call: getMessages(userId)
const MOCK_MESSAGES: Message[] = [
  { id: '1', senderId: '1', content: 'Message', timestamp: '10:20' },
  { id: '2', senderId: '1', content: 'Message', timestamp: '10:21' },
  { id: '3', senderId: 'me', content: 'Message', timestamp: '10:22' },
  { id: '4', senderId: '1', content: 'Do roboty !!!', timestamp: '10:23' },
]

export default function ChatDetail() {
  const { userId, name, online } = useLocalSearchParams<{ userId: string; name: string; online: string }>()
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList>(null)
  const isOnline = online === '1'

  const initials = name?.split(' ').map(n => n[0]).join('') ?? '?'

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: CURRENT_USER_ID,
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors.online : Colors.offline }]} />
          </View>
          <View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={[styles.onlineLabel, { color: isOnline ? Colors.online : Colors.textSecondary }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.divider} />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isOwn = item.senderId === CURRENT_USER_ID
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
          placeholder="Chat Input"
          placeholderTextColor={Colors.textSecondary}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 56,
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
  avatarWrapper: {
    position: 'relative',
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
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  onlineLabel: {
    fontSize: 12,
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
