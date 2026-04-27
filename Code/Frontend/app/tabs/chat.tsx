import { ScreenWrapper } from "@/components/ScreenWrapper"
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from "react-native"
import { useColors } from "@/contexts/ThemeContext"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState, useCallback, useRef } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { getConversations } from "@/api/endpoints/messages"
import { getUsers } from "@/api/endpoints/users"
import { getSocket } from "@/api/socket"
import * as SecureStore from "expo-secure-store"
import type { Socket } from "socket.io-client"

type Conversation = {
  other_user_id: string
  name: string
  last_message: string
  timestamp: string
  sender_id: string
}

type User = {
  id: string
  first_name: string
  last_name: string
  username: string
  role: string
}

function ConversationItem({ item, currentUserId }: { item: Conversation; currentUserId: string }) {
  const Colors = useColors()
  const initials = item.name.split(' ').map((n: string) => n[0]).join('')
  const isOwn = item.sender_id === currentUserId
  const preview = isOwn ? `You: ${item.last_message}` : item.last_message

  const styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: Colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    itemContent: {
      flex: 1,
      gap: 3,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemName: {
      color: Colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    timestamp: {
      color: Colors.textSecondary,
      fontSize: 12,
    },
    lastMessage: {
      color: Colors.textSecondary,
      fontSize: 13,
    },
  })

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: '/chatDetail' as any,
          params: { userId: item.other_user_id, name: item.name },
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{preview}</Text>
      </View>
    </TouchableOpacity>
  )
}

function NewConversationModal({
  visible,
  currentUserId,
  onClose,
}: {
  visible: boolean
  currentUserId: string
  onClose: () => void
}) {
  const Colors = useColors()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible) return
    setLoading(true)
    getUsers()
      .then(res => setUsers(res.data.filter((u: User) => u.id !== currentUserId)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [visible, currentUserId])

  const displayName = (u: User) =>
    (u.first_name || u.last_name) ? `${u.first_name} ${u.last_name}`.trim() : u.username

  const filtered = search.trim()
    ? users.filter(u => displayName(u).toLowerCase().includes(search.toLowerCase()))
    : users

  const openChat = (user: User) => {
    onClose()
    router.push({
      pathname: '/chatDetail' as any,
      params: { userId: user.id, name: displayName(user) },
    })
  }

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 16,
      paddingBottom: 32,
      maxHeight: '75%',
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    sheetTitle: {
      color: Colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surfaceElevated,
      borderRadius: 10,
      paddingHorizontal: 12,
      marginTop: 12,
      marginBottom: 4,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      color: Colors.textPrimary,
      fontSize: 14,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: Colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    itemName: {
      color: Colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    userRole: {
      color: Colors.textSecondary,
      fontSize: 12,
      textTransform: 'capitalize',
      marginTop: 2,
    },
    empty: {
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
      fontSize: 14,
    },
  })

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>New Conversation</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={u => u.id}
            renderItem={({ item }) => {
              const name = displayName(item)
              const initials = name.split(' ').map((n: string) => n[0]).filter(Boolean).join('').toUpperCase()
              return (
                <TouchableOpacity style={styles.userRow} onPress={() => openChat(item)}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemName}>{name}</Text>
                    <Text style={styles.userRole}>{item.role}</Text>
                  </View>
                </TouchableOpacity>
              )
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {search ? 'No users match your search' : 'No users found'}
              </Text>
            }
            keyboardShouldPersistTaps="handled"
          />
        )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default function ChatList() {
  const Colors = useColors()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const currentUserIdRef = useRef('')
  const socketRef = useRef<Socket | null>(null)

  useFocusEffect(
    useCallback(() => {
      let active = true
      setLoading(true)
      const load = async () => {
        try {
          const [userId, res] = await Promise.all([
            SecureStore.getItemAsync('userId'),
            getConversations(),
          ])
          if (!active) return
          currentUserIdRef.current = userId ?? ''
          setCurrentUserId(userId ?? '')
          setConversations(res.data)
        } catch (err) {
          console.error(err)
        } finally {
          if (active) setLoading(false)
        }
      }
      load()
      return () => { active = false }
    }, [])
  )

  useEffect(() => {
    let mounted = true
    getSocket().then(socket => {
      if (!mounted) return
      socketRef.current = socket
      socket.on('new_message', (msg: { sender_id: string; receiver_id: string; content: string; sent_at: string; sender_name?: string }) => {
        if (!mounted) return
        const uid = currentUserIdRef.current
        const otherUserId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id
        setConversations(prev => {
          const existing = prev.find(c => c.other_user_id === otherUserId)
          const updated: Conversation = {
            other_user_id: otherUserId,
            name: existing?.name ?? '',
            last_message: msg.content,
            timestamp: msg.sent_at,
            sender_id: msg.sender_id,
          }
          return [updated, ...prev.filter(c => c.other_user_id !== otherUserId)]
        })
      })
    }).catch(() => {})
    return () => {
      mounted = false
      socketRef.current?.off('new_message')
    }
  }, [])

  const styles = StyleSheet.create({
    list: {
      paddingTop: 12,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
      fontSize: 14,
    },
  })

  if (loading) {
    return (
      <ScreenWrapper title="Messages">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper
      title="Messages"
      rightElement={
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={26} color={Colors.primary} />
        </TouchableOpacity>
      }
    >
      <FlatList
        data={conversations}
        keyExtractor={item => item.other_user_id}
        renderItem={({ item }) => <ConversationItem item={item} currentUserId={currentUserId} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet</Text>}
      />

      <NewConversationModal
        visible={showModal}
        currentUserId={currentUserId}
        onClose={() => setShowModal(false)}
      />
    </ScreenWrapper>
  )
}
