import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  Image, 
  Switch, 
  ScrollView, 
  Platform, 
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'link';
  icon: string;
  toggleValue?: boolean;
  linkAction?: () => void;
}

export default function ProfileScreen() {
  const colors = Colors.light;
  
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: '1',
      title: 'Уведомления',
      description: 'Получать уведомления о происшествиях поблизости',
      type: 'toggle',
      icon: 'notifications',
      toggleValue: true
    },
    {
      id: '2',
      title: 'Геолокация',
      description: 'Разрешить доступ к вашему местоположению',
      type: 'toggle',
      icon: 'location-on',
      toggleValue: true
    },
    {
      id: '3',
      title: 'Личные данные',
      description: 'Управление личной информацией',
      type: 'link',
      icon: 'person',
      linkAction: () => {
        Alert.alert(
          'Личные данные',
          'Здесь вы можете изменить свои личные данные: имя, фамилию, номер телефона, email и т.д.',
          [{ text: 'OK' }]
        );
      }
    },
    {
      id: '4',
      title: 'Безопасность',
      description: 'Пароль и двухфакторная аутентификация',
      type: 'link',
      icon: 'security',
      linkAction: () => {
        Alert.alert(
          'Безопасность',
          'Здесь вы можете изменить пароль и настроить двухфакторную аутентификацию.',
          [{ text: 'OK' }]
        );
      }
    },
    {
      id: '5',
      title: 'О приложении',
      description: 'Версия, условия использования и политика конфиденциальности',
      type: 'link',
      icon: 'info',
      linkAction: () => {
        Alert.alert(
          'О приложении',
          'Версия: 1.0.0\n\nQalqan - приложение для обеспечения безопасности граждан, разработанное в рамках хакатона.\n\nДля ознакомления с условиями использования и политикой конфиденциальности, пожалуйста, посетите наш сайт.',
          [{ text: 'OK' }]
        );
      }
    }
  ]);
  
  const handleToggleSetting = (id: string) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id 
          ? { ...setting, toggleValue: !setting.toggleValue } 
          : setting
      )
    );
  };
  
  const renderSettingItem = (item: SettingItem) => {
    return (
      <Pressable
        key={item.id}
        style={[
          styles.settingItem, 
          { borderBottomColor: colors.border }
        ]}
        onPress={() => {
          if (item.type === 'link' && item.linkAction) {
            item.linkAction();
          }
        }}
      >
        <View style={[styles.settingIconContainer, { backgroundColor: colors.tint + '20' }]}>
          <MaterialIcons name={item.icon as any} size={22} color={colors.tint} />
        </View>
        
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.muted }]}>
            {item.description}
          </Text>
        </View>
        
        {item.type === 'toggle' ? (
          <Switch
            value={item.toggleValue}
            onValueChange={() => handleToggleSetting(item.id)}
            trackColor={{ false: colors.border, true: colors.tint + '70' }}
            thumbColor={item.toggleValue ? colors.tint : colors.cardBg}
            ios_backgroundColor={colors.border}
          />
        ) : (
          <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Профиль</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View 
          style={[
            styles.profileCard, 
            { 
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.profileImage}
            />
            
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                Азамат Сериков
              </Text>
              <Text style={[styles.profileEmail, { color: colors.muted }]}>
                a.serikov@gmail.com
              </Text>
            </View>
          </View>
          
          <Pressable
            style={[styles.editButton, { borderColor: colors.border }]}
            onPress={() => {
              Alert.alert(
                'Редактировать профиль',
                'Здесь вы можете изменить фото профиля и личные данные.',
                [{ text: 'OK' }]
              );
            }}
          >
            <MaterialIcons name="edit" size={16} color={colors.tint} />
            <Text style={[styles.editButtonText, { color: colors.tint }]}>
              Редактировать
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Настройки
          </Text>
          
          <View 
            style={[
              styles.settingsCard, 
              { 
                backgroundColor: colors.cardBg,
                borderColor: colors.border
              }
            ]}
          >
            {settings.map(item => renderSettingItem(item))}
          </View>
        </View>
        
        <Pressable
          style={[styles.logoutButton, { backgroundColor: colors.danger + '10' }]}
          onPress={() => {
            Alert.alert(
              'Выйти из аккаунта',
              'Вы уверены, что хотите выйти из аккаунта?',
              [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Выйти', style: 'destructive' }
              ]
            );
          }}
        >
          <MaterialIcons name="logout" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Выйти из аккаунта
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  settingsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 