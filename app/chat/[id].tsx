import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  InputAccessoryView,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ChatType {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const CHAT_TYPES: Record<string, ChatType> = {
  'police': {
    id: 'police',
    title: 'Чат с сотрудником полиции',
    subtitle: 'Консультации и помощь от полиции',
    icon: 'local-police',
    color: '#4285F4',
  },
  'manager': {
    id: 'manager',
    title: 'Чат с менеджером',
    subtitle: 'Техническая поддержка и вопросы по приложению',
    icon: 'support-agent',
    color: '#34A853',
  },
};

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'police': [
    {
      id: '1',
      text: 'Здравствуйте! Чем я могу вам помочь?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    }
  ],
  'manager': [
    {
      id: '1',
      text: 'Добрый день! Я менеджер платформы. Как я могу вам помочь с использованием приложения?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
    }
  ]
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const chatId = Array.isArray(id) ? id[0] : id;
  const chatType = CHAT_TYPES[chatId as string];
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES[chatId as string] || []);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { height: windowHeight } = Dimensions.get('window');
  
  useEffect(() => {
    // Setup keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        adjustForKeyboard(event);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        // Enable smooth animation for Android
        if (Platform.OS === 'android') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
      }
    );

    // Android specific fix for keyboard issues
    if (Platform.OS === 'android') {
      const keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        (event) => {
          // Pre-emptively start preparing for keyboard on Android
          setTimeout(() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: false });
            }
          }, 50);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
        keyboardWillShowListener.remove();
      };
    }

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Если сообщения изменились, прокручиваем в конец
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: keyboardVisible });
    }
  };
  
  // Adjust layout for different platforms
  const adjustForKeyboard = (event?: any) => {
    if (Platform.OS === 'android') {
      if (event) {
        // Get keyboard height from event for Android
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
        
        // Enable smooth animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      
      // On Android, we need to manually scroll after a short delay
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 300);
    }
    // For iOS, the KeyboardAvoidingView handles most of the work
    scrollToBottom();
  };
  
  if (!chatType) {
    return (
      <View style={styles.container}>
        <Text>Чат не найден</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Вернуться назад</Text>
        </Pressable>
      </View>
    );
  }
  
  const sendMessage = () => {
    if (message.trim().length === 0) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');
    
    // Simulate response after 1 second
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatId === 'police' 
          ? 'Спасибо за обращение. Мы обрабатываем ваш запрос.'
          : 'Благодарим за ваше сообщение. Чем еще я могу вам помочь?',
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, responseMessage]);
    }, 1000);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Generate input accessory ID for iOS
  const inputAccessoryViewID = Platform.OS === 'ios' ? 'inputAccessoryViewID' : undefined;
  
  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'android' && { paddingBottom: 0 }]}>
      <Stack.Screen
        options={{
          title: chatType.title,
          headerLeft: () => (
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </Pressable>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={[
          styles.keyboardAvoidingView,
          Platform.OS === 'android' && keyboardHeight > 0 && {
            paddingBottom: keyboardHeight + 20 // Добавляем отступ на Android с учетом высоты клавиатуры
          }
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 110}
        // Android specific props
        {...(Platform.OS === 'android' && {
          enabled: true,
          contentContainerStyle: {flex: 1}
        })}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyChat
          ]}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <Text style={styles.emptyChatText}>Начните общение прямо сейчас</Text>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userMessage : styles.agentMessage
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
              </View>
            ))
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Введите сообщение..."
            placeholderTextColor="#999"
            multiline
            inputAccessoryViewID={inputAccessoryViewID}
            onFocus={adjustForKeyboard}
            returnKeyType="default"
          />
          <Pressable
            style={[styles.sendButton, message.trim().length === 0 && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={message.trim().length === 0}
          >
            <MaterialIcons name="send" size={22} color={message.trim().length === 0 ? "#ccc" : "#fff"} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessoryBar}>
            <Pressable style={styles.accessoryButton} onPress={() => Keyboard.dismiss()}>
              <Text style={styles.accessoryButtonText}>Готово</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  headerButton: {
    marginLeft: 8,
    padding: 8,
  },
  backButton: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyChat: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyChatText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3F2FD',
    borderBottomRightRadius: 4,
  },
  agentMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  accessoryBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  accessoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  accessoryButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
}); 