import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface ChatItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  lastMessage?: string;
  lastDate?: string;
}

// Sample chat list
const CHATS: ChatItem[] = [
  {
    id: 'police',
    title: 'Чат с сотрудником полиции',
    subtitle: 'Консультации и помощь',
    icon: 'local-police',
    color: '#4285F4',
    lastMessage: 'Здравствуйте! Чем я могу вам помочь?',
    lastDate: '10:30'
  },
  {
    id: 'support',
    title: 'Техническая поддержка',
    subtitle: 'Вопросы по приложению',
    icon: 'support-agent',
    color: '#34A853',
    lastMessage: 'Как мы можем вам помочь?',
    lastDate: 'Вчера'
  }
];

export default function ChatListScreen() {
  const router = useRouter();
  const colors = Colors.light;

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <Pressable 
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={[styles.chatIcon, { backgroundColor: item.color + '20' }]}>
        <MaterialIcons name={item.icon} size={28} color={item.color} />
      </View>
      <View style={styles.chatInfo}>
        <Text style={[styles.chatTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.chatSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
        {item.lastMessage && (
          <Text 
            style={[styles.lastMessage, { color: colors.text }]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        )}
      </View>
      {item.lastDate && (
        <Text style={[styles.dateText, { color: colors.muted }]}>{item.lastDate}</Text>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Чаты</Text>
      </View>
      
      <FlatList
        data={CHATS}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
    marginLeft: 8,
  },
}); 