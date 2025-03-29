import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

type IncidentType = 'theft' | 'violence' | 'vandalism' | 'fraud' | 'other';

export default function SilentReportScreen() {
  const colors = Colors.light;
  const router = useRouter();
  const { width } = Dimensions.get('window');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('other');
  const [location, setLocation] = useState<null | { latitude: number; longitude: number }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const getLocation = async () => {
    try {
      setLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Ошибка доступа',
          'Для отправки локации происшествия необходимо разрешение на использование геолокации',
          [{ text: 'Ок' }]
        );
        setLocationLoading(false);
        return;
      }
      
      const currentLocation = await Location.getCurrentPositionAsync({});
      
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      
      setLocationLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось получить текущее местоположение. Пожалуйста, попробуйте снова.',
        [{ text: 'Ок' }]
      );
      setLocationLoading(false);
    }
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите заголовок происшествия');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите описание происшествия');
      return;
    }
    
    if (!location) {
      Alert.alert('Ошибка', 'Пожалуйста, укажите местоположение происшествия');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      Alert.alert(
        'Успешно отправлено',
        'Ваше сообщение о происшествии отправлено. Службы безопасности проверят информацию.',
        [
          { 
            text: 'Ок', 
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setIncidentType('other');
              setLocation(null);
              
              // Navigate to home or map
              router.navigate('/(tabs)' as any);
            } 
          }
        ]
      );
    }, 1500);
  };
  
  const IncidentTypeButton = ({ type, label, icon }: { type: IncidentType, label: string, icon: string }) => (
    <Pressable
      style={[
        styles.typeButton,
        incidentType === type && { 
          backgroundColor: colors.tint + '20',
          borderColor: colors.tint
        }
      ]}
      onPress={() => setIncidentType(type)}
    >
      <MaterialIcons 
        name={icon as any} 
        size={24} 
        color={incidentType === type ? colors.tint : colors.text} 
      />
      <Text style={[
        styles.typeButtonText, 
        { color: incidentType === type ? colors.tint : colors.text }
      ]}>
        {label}
      </Text>
    </Pressable>
  );
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="dark" />
      
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          }
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="light" style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Тихий репорт
              </Text>
              <View style={styles.placeholderRight} />
            </View>
          </BlurView>
        ) : (
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <View style={styles.headerContent}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Тихий репорт
              </Text>
              <View style={styles.placeholderRight} />
            </View>
          </View>
        )}
      </Animated.View>
      
      <ScrollView 
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
        >
          <Text style={[styles.formTitle, { color: colors.text }]}>
            Сообщить о происшествии
          </Text>
          
          <Text style={[styles.description, { color: colors.muted }]}>
            Быстрое сообщение о происшествии без звонка. Ваши данные будут переданы в службы безопасности.
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Тип происшествия</Text>
            
            <View style={styles.typesContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typesContent}
              >
                <IncidentTypeButton type="theft" label="Кража" icon="shopping-bag" />
                <IncidentTypeButton type="violence" label="Насилие" icon="person" />
                <IncidentTypeButton type="vandalism" label="Вандализм" icon="construction" />
                <IncidentTypeButton type="fraud" label="Мошенничество" icon="credit-card" />
                <IncidentTypeButton type="other" label="Другое" icon="warning" />
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Заголовок</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Краткое описание происшествия"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Описание</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Подробное описание ситуации..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Местоположение</Text>
            
            {!location ? (
              <Pressable
                style={[
                  styles.locationButton,
                  { 
                    backgroundColor: locationLoading ? colors.cardBg : colors.tint,
                    opacity: locationLoading ? 0.7 : 1
                  }
                ]}
                onPress={getLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.tint} />
                ) : (
                  <>
                    <MaterialIcons name="my-location" size={20} color="white" />
                    <Text style={styles.locationButtonText}>
                      Использовать текущую локацию
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <View style={[
                styles.locationInfo,
                { 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.tint
                }
              ]}>
                <MaterialIcons name="check-circle" size={20} color={colors.tint} />
                <Text style={[styles.locationText, { color: colors.text }]}>
                  Локация определена
                </Text>
                <Pressable
                  style={styles.removeLocationButton}
                  onPress={() => setLocation(null)}
                >
                  <MaterialIcons name="close" size={18} color={colors.danger} />
                </Pressable>
              </View>
            )}
          </View>
          
          <Pressable
            style={[
              styles.submitButton,
              { 
                backgroundColor: isSubmitting ? colors.cardBg : colors.tint,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="white" />
                <Text style={styles.submitButtonText}>
                  Отправить сообщение
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 10,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  header: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  placeholderRight: {
    width: 40,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 24,
    paddingBottom: 120,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typesContainer: {
    marginHorizontal: -24,
  },
  typesContent: {
    paddingHorizontal: 24,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 120,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  removeLocationButton: {
    padding: 5,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 