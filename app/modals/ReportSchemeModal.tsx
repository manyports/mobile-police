import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { schemesApi } from '@/app/services/api';

const ERROR_COLOR = '#FF3B30'; 

export default function ReportSchemeModal() {
  const colors = Colors.light;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const [reporterInfo, setReporterInfo] = useState({
    fullName: '',
    contactPhone: '',
    email: '',
    isVictim: false
  });
  
  const [schemeDetails, setSchemeDetails] = useState({
    title: '',
    description: '',
    scammerInfo: '',
    location: '',
    financialLoss: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!reporterInfo.fullName.trim()) {
      newErrors.fullName = 'Пожалуйста, укажите ваше имя';
    }
    
    if (!reporterInfo.contactPhone.trim()) {
      newErrors.contactPhone = 'Пожалуйста, укажите контактный телефон';
    }
    
    if (!schemeDetails.title.trim()) {
      newErrors.title = 'Пожалуйста, укажите название схемы';
    }
    
    if (!schemeDetails.description.trim()) {
      newErrors.description = 'Пожалуйста, добавьте описание';
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
      console.log(`🚀 Submitting scheme report (ID: ${requestId})`);
      
      const financialLoss = schemeDetails.financialLoss.trim() 
        ? parseInt(schemeDetails.financialLoss) 
        : undefined;
      
      const schemeData = {
        reporterInfo: {
          ...reporterInfo,
          _requestId: requestId
        },
        schemeDetails: {
          ...schemeDetails,
          financialLoss,
          dateOccurred: new Date()
        }
      };
      
      console.log(`📤 Sending scheme data (ID: ${requestId}):`, schemeData);
      const response = await schemesApi.reportScheme(schemeData);
      console.log(`📥 Received scheme response (ID: ${requestId}):`, response);
      
      setIsLoading(false);
      
      // Handle different response formats
      const message = response.message || 'Отчет о схеме мошенничества успешно отправлен.';
      
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
      console.error('Error reporting scheme:', error);
      setIsLoading(false);
      
      // More detailed error handling
      let errorMessage = 'Произошла ошибка при отправке отчета. Пожалуйста, попробуйте позже.';
      
      if (error.response) {
        // The request was made and the server responded with an error status code
        console.error('Server responded with error:', error.response.status, error.response.data);
        errorMessage = `Ошибка сервера: ${error.response.status}. ${error.response.data?.message || ''}`;
      } else if (error.request) {
        // The request was made but no response was received - network error
        console.error('Network error - no response:', error.request);
        errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету и убедитесь, что сервер запущен.';
      } else {
        // Something happened in setting up the request
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
    setReporterInfo({
      fullName: '',
      contactPhone: '',
      email: '',
      isVictim: false
    });
    
    setSchemeDetails({
      title: '',
      description: '',
      scammerInfo: '',
      location: '',
      financialLoss: ''
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
              Сообщить о схеме мошенничества
            </Text>
            <Pressable onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Заполните форму, чтобы сообщить о схеме мошенничества. Ваш отчет поможет другим гражданам избежать обмана.
            </Text>
            
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Информация о заявителе
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Ваше имя*
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: errors.fullName ? ERROR_COLOR : colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={reporterInfo.fullName}
                onChangeText={(text) => setReporterInfo({...reporterInfo, fullName: text})}
                placeholder="Иванов Иван"
                placeholderTextColor={colors.muted}
              />
              {errors.fullName && (
                <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                  {errors.fullName}
                </Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Контактный телефон*
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: errors.contactPhone ? ERROR_COLOR : colors.border,
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
              {errors.contactPhone && (
                <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                  {errors.contactPhone}
                </Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Email (необязательно)
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
                value={reporterInfo.email}
                onChangeText={(text) => setReporterInfo({...reporterInfo, email: text})}
                placeholder="example@email.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Pressable 
                style={styles.checkboxContainer}
                onPress={() => setReporterInfo({...reporterInfo, isVictim: !reporterInfo.isVictim})}
              >
                <View style={[
                  styles.checkbox, 
                  { 
                    borderColor: colors.border,
                    backgroundColor: reporterInfo.isVictim ? colors.tint : 'transparent' 
                  }
                ]}>
                  {reporterInfo.isVictim && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Я стал(а) жертвой этого мошенничества
                </Text>
              </Pressable>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Информация о схеме
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Название схемы*
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: errors.title ? ERROR_COLOR : colors.border,
                    color: colors.text,
                    backgroundColor: colors.subtleBg
                  }
                ]}
                value={schemeDetails.title}
                onChangeText={(text) => setSchemeDetails({...schemeDetails, title: text})}
                placeholder="Например: Фальшивые СМС о блокировке карты"
                placeholderTextColor={colors.muted}
              />
              {errors.title && (
                <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                  {errors.title}
                </Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Описание схемы*
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
                value={schemeDetails.description}
                onChangeText={(text) => setSchemeDetails({...schemeDetails, description: text})}
                placeholder="Опишите подробно как работает схема мошенничества"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={5}
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
                Информация о мошеннике (если известно)
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
                value={schemeDetails.scammerInfo}
                onChangeText={(text) => setSchemeDetails({...schemeDetails, scammerInfo: text})}
                placeholder="Имя, контакты, организация и т.д."
                placeholderTextColor={colors.muted}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Место происшествия
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
                value={schemeDetails.location}
                onChangeText={(text) => setSchemeDetails({...schemeDetails, location: text})}
                placeholder="Например: г. Алматы или онлайн"
                placeholderTextColor={colors.muted}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Финансовые потери (если были, в тенге)
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
                value={schemeDetails.financialLoss}
                onChangeText={(text) => {
                  // Allow only numbers
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setSchemeDetails({...schemeDetails, financialLoss: numericValue});
                }}
                placeholder="0"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
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
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
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
}); 