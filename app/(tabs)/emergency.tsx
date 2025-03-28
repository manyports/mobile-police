import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  Platform, 
  Animated, 
  Alert,
  Vibration,
  Linking,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const EMERGENCY_CONTACTS = [
  {
    id: '1',
    title: 'Полиция',
    number: '102',
    icon: 'local-police',
    color: '#2563EB'
  },
  {
    id: '2',
    title: 'Скорая помощь',
    number: '103',
    icon: 'healing',
    color: '#EF4444'
  },
  {
    id: '3',
    title: 'Пожарная служба',
    number: '101',
    icon: 'local-fire-department',
    color: '#F59E0B'
  },
  {
    id: '4',
    title: 'Служба спасения',
    number: '112',
    icon: 'emergency',
    color: '#10B981'
  }
];

export default function EmergencyScreen() {
  const colors = Colors.light;
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosTimer, setSOSTimer] = useState(5);
  const [showDirectoryWarning, setShowDirectoryWarning] = useState(true);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sosButtonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
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
  
  useEffect(() => {
    if (isSOSActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      const interval = setInterval(() => {
        Vibration.vibrate(200);
      }, 1000);
      
      const timer = setInterval(() => {
        setSOSTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            clearInterval(interval);
            Vibration.cancel();
            makeEmergencyCall('102');
            setIsSOSActive(false);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(timer);
        clearInterval(interval);
        Vibration.cancel();
      };
    } else {
      pulseAnim.setValue(1);
      setSOSTimer(5);
    }
  }, [isSOSActive]);
  
  const animateSosButtonPress = () => {
    Animated.sequence([
      Animated.timing(sosButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sosButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleSOSPress = () => {
    animateSosButtonPress();
    
    if (isSOSActive) {
      setIsSOSActive(false);
      return;
    }
    
    setIsSOSActive(true);
    
    Alert.alert(
      'SOS активирован',
      `Звонок в службу 102 будет совершен через ${sosTimer} секунд. Нажмите отмена, чтобы остановить.`,
      [
        {
          text: 'Отмена',
          onPress: () => setIsSOSActive(false),
          style: 'cancel',
        },
      ]
    );
  };
  
  const makeEmergencyCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };
  
  const handleEmergencyPress = (number: string, title: string) => {
    Alert.alert(
      `Вызов ${title}`,
      `Вы собираетесь позвонить по номеру ${number}. Продолжить?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Позвонить',
          onPress: () => makeEmergencyCall(number),
        },
      ]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Экстренная связь</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          В случае опасности нажмите кнопку SOS
        </Text>
      </Animated.View>
      
      <View style={styles.sosContainer}>
        <Animated.View 
          style={[
            styles.sosButtonWrapper,
            {
              transform: [
                { scale: isSOSActive ? pulseAnim : sosButtonScale }
              ],
            },
          ]}
        >
          <Pressable
            style={[
              styles.sosButton,
              isSOSActive && { backgroundColor: colors.danger }
            ]}
            onPress={handleSOSPress}
          >
            <MaterialIcons 
              name="warning" 
              size={48} 
              color="white" 
            />
            <Text style={styles.sosButtonText}>
              {isSOSActive ? `ОТМЕНА (${sosTimer})` : "SOS"}
            </Text>
          </Pressable>
        </Animated.View>
        
        <Text style={[styles.sosHint, { color: colors.muted }]}>
          Нажмите и удерживайте для вызова экстренной помощи
        </Text>
      </View>
      
      <View style={styles.directoryContainer}>
        <View style={styles.directoryHeader}>
          <Text style={[styles.directoryTitle, { color: colors.text }]}>
            Экстренные службы
          </Text>
          {showDirectoryWarning && (
            <Pressable
              style={styles.directoryWarning}
              onPress={() => setShowDirectoryWarning(false)}
            >
              <MaterialIcons name="info" size={18} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                Только для экстренных ситуаций
              </Text>
              <MaterialIcons name="close" size={16} color={colors.warning} />
            </Pressable>
          )}
        </View>
        
        <View style={styles.contactsGrid}>
          {EMERGENCY_CONTACTS.map(contact => (
            <Pressable
              key={contact.id}
              style={[
                styles.contactButton,
                {
                  backgroundColor: 'white',
                  borderColor: colors.border
                }
              ]}
              onPress={() => handleEmergencyPress(contact.number, contact.title)}
            >
              <View style={[styles.contactIcon, { backgroundColor: contact.color + '20' }]}>
                <MaterialIcons name={contact.icon as any} size={28} color={contact.color} />
              </View>
              <Text style={[styles.contactTitle, { color: colors.text }]}>
                {contact.title}
              </Text>
              <Text style={[styles.contactNumber, { color: contact.color }]}>
                {contact.number}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.safeTipsContainer}>
        <Text style={[styles.safeTipsTitle, { color: colors.text }]}>
          Советы безопасности
        </Text>
        <View 
          style={[
            styles.tipCard, 
            { 
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.tipHeader}>
            <MaterialIcons name="lightbulb" size={20} color={colors.warning} />
            <Text style={[styles.tipText, { color: colors.text }]}>
              Оставайтесь на линии с оператором до прибытия помощи
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const contactButtonWidth = (width - 48 - 16) / 2;

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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  sosButtonWrapper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  sosHint: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  directoryContainer: {
    marginHorizontal: 24,
    marginTop: 20,
  },
  directoryHeader: {
    marginBottom: 16,
  },
  directoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  directoryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  warningText: {
    fontSize: 14,
    marginHorizontal: 8,
    flex: 1,
  },
  contactsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactButton: {
    width: contactButtonWidth,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  safeTipsContainer: {
    marginHorizontal: 24,
    marginTop: 8,
  },
  safeTipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
}); 