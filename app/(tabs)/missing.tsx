import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  Image, 
  ScrollView, 
  Platform, 
  Animated,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  lastSeen: string;
  location: string;
  description: string;
  photo: string;
  isAmberAlert: boolean;
  contactPhone: string;
}

export default function MissingPersonsScreen() {
  const colors = Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  const missingPersons: MissingPerson[] = [
    {
      id: '1',
      name: 'Иванов Алексей',
      age: 12,
      gender: 'male',
      lastSeen: '15.05.2023',
      location: 'г. Алматы, район Ауэзова',
      description: 'Был одет в синюю куртку, джинсы и белые кроссовки. Рост 150 см, худощавого телосложения.',
      photo: 'https://randomuser.me/api/portraits/men/43.jpg',
      isAmberAlert: true,
      contactPhone: '+7 (701) 555-1234'
    },
    {
      id: '2',
      name: 'Ахметова Айгуль',
      age: 16,
      gender: 'female',
      lastSeen: '10.05.2023',
      location: 'г. Астана, район Есиль',
      description: 'Была одета в черное пальто, темные джинсы. Рост 165 см, средней комплекции, темные волосы.',
      photo: 'https://randomuser.me/api/portraits/women/63.jpg',
      isAmberAlert: true,
      contactPhone: '+7 (702) 555-5678'
    },
    {
      id: '3',
      name: 'Сергеев Максим',
      age: 35,
      gender: 'male',
      lastSeen: '05.05.2023',
      location: 'г. Караганда, Михайловка',
      description: 'Был одет в рабочую форму синего цвета. Рост 180 см, спортивного телосложения.',
      photo: 'https://randomuser.me/api/portraits/men/22.jpg',
      isAmberAlert: false,
      contactPhone: '+7 (705) 555-9876'
    },
    {
      id: '4',
      name: 'Петрова Елена',
      age: 27,
      gender: 'female',
      lastSeen: '01.05.2023',
      location: 'г. Алматы, Медеуский район',
      description: 'Была одета в красную куртку и черные брюки. Рост 170 см, длинные русые волосы.',
      photo: 'https://randomuser.me/api/portraits/women/28.jpg',
      isAmberAlert: false,
      contactPhone: '+7 (707) 555-4321'
    },
    {
      id: '5',
      name: 'Кузнецов Дмитрий',
      age: 42,
      gender: 'male',
      lastSeen: '28.04.2023',
      location: 'г. Шымкент, центр города',
      description: 'Был одет в темный костюм. Рост 175 см, средней комплекции, темные короткие волосы.',
      photo: 'https://randomuser.me/api/portraits/men/53.jpg',
      isAmberAlert: false,
      contactPhone: '+7 (701) 555-8765'
    }
  ];
  
  const filteredAmberAlerts = missingPersons
    .filter(person => person.isAmberAlert)
    .filter(person => 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
  const filteredRegularMissing = missingPersons
    .filter(person => !person.isAmberAlert)
    .filter(person => 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const renderPersonCard = (person: MissingPerson, index: number) => {
    const itemAnimationValue = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(itemAnimationValue, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);
    
    return (
      <Animated.View
        key={person.id}
        style={{
          opacity: itemAnimationValue,
          transform: [{ 
            translateY: itemAnimationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }}
      >
        <Pressable
          style={[
            styles.personCard, 
            { 
              backgroundColor: colors.cardBg,
              borderColor: person.isAmberAlert ? colors.warning : colors.border
            }
          ]}
          onPress={() => {
            Alert.alert(
              'Информация о пропавшем',
              `Имя: ${person.name}\nВозраст: ${person.age}\nПол: ${person.gender === 'male' ? 'Мужской' : 'Женский'}\nПоследний раз видели: ${person.lastSeen}\nМесто: ${person.location}\nОписание: ${person.description}\nКонтактный телефон: ${person.contactPhone}`,
              [{ text: 'OK' }]
            );
          }}
        >
          {person.isAmberAlert && (
            <View style={styles.amberAlertBadge}>
              <MaterialIcons name="warning" size={14} color="white" />
              <Text style={styles.amberAlertText}>Amber Alert</Text>
            </View>
          )}
          
          <View style={styles.personCardContent}>
            <Image 
              source={{ uri: person.photo }} 
              style={styles.personPhoto} 
            />
            
            <View style={styles.personInfo}>
              <Text style={[styles.personName, { color: colors.text }]}>
                {person.name}
              </Text>
              
              <Text style={[styles.personDetails, { color: colors.muted }]}>
                {person.age} лет, {person.gender === 'male' ? 'мужской' : 'женский'}
              </Text>
              
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={14} color={colors.muted} />
                <Text 
                  style={[styles.locationText, { color: colors.muted }]}
                  numberOfLines={1}
                >
                  {person.location}
                </Text>
              </View>
              
              <View style={styles.dateRow}>
                <MaterialIcons name="event" size={14} color={colors.muted} />
                <Text style={[styles.dateText, { color: colors.muted }]}>
                  Пропал(а): {person.lastSeen}
                </Text>
              </View>
              
              <Pressable
                style={[styles.contactButton, { backgroundColor: colors.tint }]}
                onPress={() => {
                  Alert.alert(
                    'Связаться',
                    `Позвонить по номеру: ${person.contactPhone}`,
                    [
                      { text: 'Отмена', style: 'cancel' },
                      { text: 'Позвонить' }
                    ]
                  );
                }}
              >
                <MaterialIcons name="phone" size={14} color="white" />
                <Text style={styles.contactButtonText}>Связаться</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
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
        <Text style={[styles.title, { color: colors.text }]}>Розыск</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Информация о пропавших людях
        </Text>
      </Animated.View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.subtleBg, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Поиск по имени или местоположению"
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <Pressable onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAmberAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.warning + '20' }]}>
                <MaterialIcons name="warning" size={18} color={colors.warning} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Amber Alert
              </Text>
            </View>
            {filteredAmberAlerts.map((person, index) => renderPersonCard(person, index))}
          </View>
        )}
        
        {filteredRegularMissing.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.tint + '20' }]}>
                <MaterialIcons name="person-search" size={18} color={colors.tint} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Пропавшие люди
              </Text>
            </View>
            {filteredRegularMissing.map((person, index) => renderPersonCard(person, index + filteredAmberAlerts.length))}
          </View>
        )}
        
        {filteredAmberAlerts.length === 0 && filteredRegularMissing.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={64} color={colors.muted} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              Ничего не найдено
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
              Попробуйте изменить параметры поиска
            </Text>
          </View>
        )}
      </ScrollView>
      
      <Pressable
        style={[styles.reportButton, { backgroundColor: colors.tint }]}
        onPress={() => {
          Alert.alert(
            'Сообщить о пропавшем человеке',
            'Для подачи заявления о пропаже человека вы можете обратиться в ближайший отдел полиции или позвонить по номеру 102.',
            [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Позвонить 102' },
            ]
          );
        }}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.reportButtonText}>Сообщить о пропаже</Text>
      </Pressable>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  personCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  amberAlertBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  amberAlertText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  personCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  personPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  personInfo: {
    flex: 1,
    marginLeft: 16,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  personDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  reportButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 70,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
}); 