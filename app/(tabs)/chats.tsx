import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface ChatOption {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const CHAT_OPTIONS: ChatOption[] = [
  {
    id: 'police',
    title: 'Чат с сотрудником полиции',
    subtitle: 'Консультации и помощь от полиции',
    icon: 'local-police',
    color: '#4285F4',
  },
  {
    id: 'manager',
    title: 'Чат с менеджером',
    subtitle: 'Техническая поддержка и вопросы по приложению',
    icon: 'support-agent',
    color: '#34A853',
  },
];

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Чаты</Text>
        </View>
        
        <View style={styles.chatOptionsContainer}>
          {CHAT_OPTIONS.map((option) => (
            <Link key={option.id} href={`/chat/${option.id}`} asChild>
              <Pressable style={styles.chatOption}>
                <View style={[styles.iconContainer, { backgroundColor: option.color + '10' }]}>
                  <MaterialIcons name={option.icon} size={28} color={option.color} />
                </View>
                <View style={styles.chatOptionContent}>
                  <Text style={styles.chatOptionTitle}>{option.title}</Text>
                  <Text style={styles.chatOptionSubtitle}>{option.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </Pressable>
            </Link>
          ))}
        </View>
        
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={20} color="#4285F4" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Выберите чат для связи с представителем службы. Ответ обычно поступает в течение 15 минут.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  chatOptionsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  chatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chatOptionContent: {
    flex: 1,
  },
  chatOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chatOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF5FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
}); 