import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  Modal, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import api from '@/app/services/api';

const { scammersApi } = api;

const ERROR_COLOR = '#FF3B30'; 

export default function ReportScammerModal() {
  const colors = Colors.light;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'phone' | 'online' | 'financial' | 'other'>('phone');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  const [reporterInfo, setReporterInfo] = useState({
    fullName: '',
    contactPhone: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Пожалуйста, укажите имя или название';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Пожалуйста, добавьте описание';
    }
    
    if (!contactInfo.trim()) {
      newErrors.contactInfo = 'Пожалуйста, укажите контактную информацию';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      console.log(`🚀 Submitting scammer report (ID: ${requestId})`);
      
      const scammerData = {
        name,
        type,
        description,
        contactInfo,
        additionalInfo: additionalInfo.trim() ? additionalInfo : undefined,
        
        reporterInfo: {
          fullName: reporterInfo.fullName.trim(),
          contactPhone: reporterInfo.contactPhone.trim(),
        },
        
        _requestId: requestId 
      };
      
      console.log(`📤 Sending data (ID: ${requestId}):`, scammerData);
      const response = await scammersApi.reportScammer(scammerData);
      console.log(`📥 Received response (ID: ${requestId}):`, response);
      
      setIsLoading(false);
      
      const message = response.message || 'Отчет отправлен успешно';
      
      Alert.alert(
        'Отчет отправлен',
        message,
        [
          { 
            text: 'OK', 
            onPress: () => {
              resetForm();
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error reporting scammer:', error);
      setIsLoading(false);
      
      let errorMessage = 'Произошла ошибка при отправке отчета. Пожалуйста, попробуйте позже.';
      
      if (error.response) {
        console.error('Server responded with error:', error.response.status, error.response.data);
        errorMessage = `Ошибка сервера: ${error.response.status}. ${error.response.data?.message || ''}`;
      } else if (error.request) {
        console.error('Network error - no response:', error.request);
        errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету и убедитесь, что сервер запущен.';
      } else {
        console.error('Request setup error:', error.message);
        errorMessage = `Ошибка: ${error.message}`;
      }
      
      Alert.alert(
        'Ошибка отправки',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };
  
  const resetForm = () => {
    setName('');
    setType('phone');
    setDescription('');
    setContactInfo('');
    setAdditionalInfo('');
    setReporterInfo({
      fullName: '',
      contactPhone: ''
    });
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Сообщить о мошеннике
            </Text>
            <Pressable onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Заполните форму, чтобы сообщить о подозрительной деятельности или о мошеннике. Ваш отчет поможет другим избежать мошенничества.
            </Text>
            
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Информация о мошеннике
              </Text>
              <Text style={[styles.requiredInfoText, { color: colors.muted }]}>
                (* - обязательные поля)
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Имя/название мошенника или организации*
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: errors.name ? ERROR_COLOR : colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Например: ТОО 'Инвест Плюс'"
                placeholderTextColor={colors.muted}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                  {errors.name}
                </Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Тип мошенничества*
              </Text>
              <View style={styles.typeButtons}>
                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'phone' && [styles.activeTypeButton, { borderColor: colors.tint }]
                  ]}
                  onPress={() => setType('phone')}
                >
                  <MaterialIcons 
                    name="phone" 
                    size={20} 
                    color={type === 'phone' ? colors.tint : colors.muted} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText, 
                      { color: type === 'phone' ? colors.tint : colors.muted }
                    ]}
                  >
                    Телефонное
                  </Text>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'online' && [styles.activeTypeButton, { borderColor: colors.tint }]
                  ]}
                  onPress={() => setType('online')}
                >
                  <MaterialIcons 
                    name="computer" 
                    size={20} 
                    color={type === 'online' ? colors.tint : colors.muted} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText, 
                      { color: type === 'online' ? colors.tint : colors.muted }
                    ]}
                  >
                    Интернет
                  </Text>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'financial' && [styles.activeTypeButton, { borderColor: colors.tint }]
                  ]}
                  onPress={() => setType('financial')}
                >
                  <MaterialIcons 
                    name="attach-money" 
                    size={20} 
                    color={type === 'financial' ? colors.tint : colors.muted} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText, 
                      { color: type === 'financial' ? colors.tint : colors.muted }
                    ]}
                  >
                    Финансовое
                  </Text>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'other' && [styles.activeTypeButton, { borderColor: colors.tint }]
                  ]}
                  onPress={() => setType('other')}
                >
                  <MaterialIcons 
                    name="warning" 
                    size={20} 
                    color={type === 'other' ? colors.tint : colors.muted} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText, 
                      { color: type === 'other' ? colors.tint : colors.muted }
                    ]}
                  >
                    Другое
                  </Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Описание мошенничества*
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  { 
                    borderColor: errors.description ? ERROR_COLOR : colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Опишите как работает схема и как распознать мошенника"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                  {errors.description}
                </Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Контактная информация мошенника*
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: errors.contactInfo ? ERROR_COLOR : colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={contactInfo}
                onChangeText={setContactInfo}
                placeholder="Номер телефона, email, сайт, адрес и т.д."
                placeholderTextColor={colors.muted}
              />
              {errors.contactInfo && (
                <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                  {errors.contactInfo}
                </Text>
              )}
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Ваши контактные данные
              </Text>
              <Text style={[styles.optionalInfoText, { color: colors.muted }]}>
                (Необязательно)
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Ваше имя (необязательно)
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={reporterInfo.fullName}
                onChangeText={(text) => setReporterInfo({...reporterInfo, fullName: text})}
                placeholder="Ваше имя"
                placeholderTextColor={colors.muted}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Ваш контактный телефон (необязательно)
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={reporterInfo.contactPhone}
                onChangeText={(text) => setReporterInfo({...reporterInfo, contactPhone: text})}
                placeholder="+7 (XXX) XXX-XXXX"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Дополнительная информация
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                placeholder="Любая дополнительная информация, которая может быть полезна"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            <Text style={[styles.disclaimer, { color: colors.muted }]}>
              *Обязательные поля
            </Text>
            
            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="send" size={18} color="white" />
                  <Text style={styles.submitButtonText}>Отправить</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  activeTypeButton: {
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 12,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  requiredInfoText: {
    fontSize: 12,
  },
  optionalInfoText: {
    fontSize: 12,
  },
}); 