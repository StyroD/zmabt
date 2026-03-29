import { ScreenWrapper } from "@/components/ScreenWrapper"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from "react-native"
import { Colors } from "@/constants/color"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

type Conversation = {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
}

// Replace with real API call: getConversations()
const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Jozef Novak', lastMessage: 'Do roboty !!!', timestamp: '10:30', unread: 2, online: true },
  { id: '2', name: 'Maria Kovac', lastMessage: 'Ok, uvidime sa zajtra', timestamp: '9:15', unread: 0, online: false },
  { id: '3', name: 'Peter Horak', lastMessage: 'Projekt je hotovy', timestamp: 'Vcera', unread: 0, online: true },
  { id: '4', name: 'Jana Novakova', lastMessage: 'Posli mi dokumenty', timestamp: 'Po', unread: 1, online: false },
]

function ConversationItem({ item }: { item: Conversation }) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: '/chatDetail' as any,
          params: { userId: item.id, name: item.name, online: item.online ? '1' : '0' },
        })
      }
    >
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.itemFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function ChatList() {
  return (
    <ScreenWrapper
      title="Messages"
      rightElement={
        <Pressable onPress={() => {}}>
          <Ionicons name="add" size={26} color={Colors.primary} />
        </Pressable>
      }
    >
      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ConversationItem item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
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
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.background,
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
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
})
