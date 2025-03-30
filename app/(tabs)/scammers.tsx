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
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import api from '@/app/services/api';
import { useRouter } from 'expo-router';

// Get API services 
const { scammersApi, schemesApi } = api;

interface ScammerProfile {
  id?: string;
  _id?: string;
  name: string;
  type: 'phone' | 'online' | 'financial' | 'other';
  description: string;
  contactInfo: string;
  additionalInfo?: string;
  dateAdded: string;
  reportCount?: number;
  verified?: boolean;
}

interface ScamScheme {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  warningSign: string[];
  howToAvoid: string[];
  dateAdded?: string;
  reportCount?: number;
  verified?: boolean;
}

// Helper function to format dates coming from MongoDB
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Check if it's already in DD.MM.YYYY format
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Convert from ISO date to DD.MM.YYYY
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (err) {
    console.error('Error parsing date:', err);
    return dateString; // Return original if parsing fails
  }
};

export default function ScammersScreen() {
  const colors = Colors.light;
  const [activeTab, setActiveTab] = useState('schemes');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [scammers, setScammers] = useState<ScammerProfile[]>([]);
  const [scamSchemes, setScamSchemes] = useState<ScamScheme[]>([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  const [itemAnimationValues, setItemAnimationValues] = useState<{[key: string]: Animated.Value}>({});
  
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
  
  // Effect to fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'scammers') {
          const response = await scammersApi.getAllScammers();
          console.log('Scammers API response:', response); // Debug log
          
          // Format data from MongoDB
          const formattedScammers = response.map((scammer: any) => ({
            ...scammer,
            id: scammer._id,
            // Format date if it's an ISO string
            dateAdded: formatDate(scammer.dateAdded)
          }));
          
          setScammers(formattedScammers);
        } else {
          const response = await schemesApi.getAllSchemes();
          console.log('Schemes API response:', response); // Debug log
          
          // Format data from MongoDB
          const formattedSchemes = response.map((scheme: any) => ({
            ...scheme,
            id: scheme._id || scheme.id,
            // Format date if present and it's an ISO string
            dateAdded: scheme.dateAdded ? formatDate(scheme.dateAdded) : undefined
          }));
          
          setScamSchemes(formattedSchemes);
        }
      } catch (err: any) {
        console.error(`Error fetching ${activeTab}:`, err);
        
        let errorMessage = `Не удалось загрузить данные. ${err.message || 'Пожалуйста, повторите попытку позже.'}`;
        
        if (err.response) {
          errorMessage = `Сервер вернул ошибку: ${err.response.status} - ${err.response.statusText || err.message}`;
          console.error('Error response data:', err.response.data);
        } else if (err.request) {
          errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
          console.error('Request that caused error:', err.request);
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);
  
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
  
  // Reset expanded cards when active tab changes
  useEffect(() => {
    setExpandedCards({});
  }, [activeTab]);
  
  // Set up animation values for new items
  useEffect(() => {
    const newAnimationValues: {[key: string]: Animated.Value} = {};
    const items = activeTab === 'schemes' ? scamSchemes : scammers;
    
    // Create animation values for all visible items
    items.forEach((item) => {
      const itemId = item._id || item.id;
      if (itemId && !itemAnimationValues[itemId]) {
        newAnimationValues[itemId] = new Animated.Value(0);
      }
    });
    
    // Merge with existing animation values
    if (Object.keys(newAnimationValues).length > 0) {
      setItemAnimationValues(prev => ({
        ...prev,
        ...newAnimationValues
      }));
    }
    
    // Trigger animations sequentially after a short delay
    setTimeout(() => {
      items.forEach((item, index) => {
        const itemId = item._id || item.id;
        if (itemId && (itemAnimationValues[itemId] || newAnimationValues[itemId])) {
          const animValue = itemAnimationValues[itemId] || newAnimationValues[itemId];
          Animated.timing(animValue, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
          }).start();
        }
      });
    }, 100);
  }, [scammers, scamSchemes, activeTab]);

  // Safe filtering with null checks for scammers
  const filteredScammers = scammers.filter(scammer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (scammer.name?.toLowerCase().includes(query) || false) ||
      (scammer.description?.toLowerCase().includes(query) || false) ||
      (scammer.contactInfo?.toLowerCase().includes(query) || false) ||
      (scammer.additionalInfo?.toLowerCase().includes(query) || false) ||
      (scammer.type?.toLowerCase().includes(query) || false)
    );
  });
  
  // Safe filtering with null checks for schemes
  const filteredSchemes = scamSchemes.filter(scheme => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Search in title and description
    const inTitle = scheme.title?.toLowerCase().includes(query) || false;
    const inDesc = scheme.description?.toLowerCase().includes(query) || false;
    
    // Search in warning signs
    const inWarnings = scheme.warningSign?.some(sign => 
      sign.toLowerCase().includes(query)
    ) || false;
    
    // Search in how to avoid tips
    const inTips = scheme.howToAvoid?.some(tip => 
      tip.toLowerCase().includes(query)
    ) || false;
    
    return inTitle || inDesc || inWarnings || inTips;
  });
  
  // Handle card expansion toggle
  const toggleCardExpanded = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getTypeIcon = (type: ScammerProfile['type']) => {
    switch (type) {
      case 'phone': return 'phone';
      case 'online': return 'computer';
      case 'financial': return 'attach-money';
      default: return 'warning';
    }
  };
  
  const getTypeColor = (type: ScammerProfile['type']) => {
    switch (type) {
      case 'phone': return '#FF9500';
      case 'online': return '#007AFF';
      case 'financial': return '#30D158';
      default: return '#FF3B30';
    }
  };
  
  const getTypeText = (type: ScammerProfile['type']) => {
    switch (type) {
      case 'phone': return 'Телефонное мошенничество';
      case 'online': return 'Интернет-мошенничество';
      case 'financial': return 'Финансовое мошенничество';
      default: return 'Другой тип мошенничества';
    }
  };
  
  const renderScammerCard = (scammer: ScammerProfile, index: number) => {
    // Get the unique ID, prioritize _id for MongoDB compatibility
    const id = scammer._id || scammer.id;
    
    // Use the pre-created animation value
    const itemAnimationValue = id && itemAnimationValues[id] ? itemAnimationValues[id] : new Animated.Value(0);
    
    return (
      <Animated.View
        key={id}
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
        <View 
          style={[
            styles.card, 
            { 
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.typeIcon, { backgroundColor: getTypeColor(scammer.type) + '20' }]}>
              <MaterialIcons name={getTypeIcon(scammer.type)} size={20} color={getTypeColor(scammer.type)} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {scammer.name}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                {getTypeText(scammer.type)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.cardDescription, { color: colors.text }]}>
            {scammer.description}
          </Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="contact-phone" size={16} color={colors.muted} />
            <Text style={[styles.infoText, { color: colors.muted }]}>
              {scammer.contactInfo}
            </Text>
          </View>
          
          {scammer.additionalInfo && (
            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={16} color={colors.muted} />
              <Text style={[styles.infoText, { color: colors.muted }]}>
                {scammer.additionalInfo}
              </Text>
            </View>
          )}
          
          <View style={styles.cardFooter}>
            <Text style={[styles.dateText, { color: colors.muted }]}>
              Добавлено: {scammer.dateAdded}
            </Text>
            
            <Pressable
              style={[styles.reportButton, { backgroundColor: colors.tint + '20' }]}
              onPress={() => handleReportScammer(scammer)}
            >
              <MaterialIcons name="flag" size={14} color={colors.tint} />
              <Text style={[styles.reportButtonText, { color: colors.tint }]}>
                Дополнить информацию
              </Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };
  
  const renderSchemeCard = (scheme: ScamScheme, index: number) => {
    // Get the unique ID, prioritize _id for MongoDB compatibility
    const id = scheme._id || scheme.id;
    
    // Use the pre-created animation value
    const itemAnimationValue = id && itemAnimationValues[id] ? itemAnimationValues[id] : new Animated.Value(0);
    const expanded = id ? expandedCards[id] || false : false;
    
    return (
      <Animated.View
        key={id}
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
        <View 
          style={[
            styles.card, 
            { 
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }
          ]}
        >
          <Pressable
            style={styles.schemeHeader}
            onPress={() => id && toggleCardExpanded(id)}
          >
            <View style={styles.schemeTitleContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {scheme.title}
              </Text>
            </View>
            <MaterialIcons 
              name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={colors.muted} 
            />
          </Pressable>
          
          <Text 
            style={[styles.cardDescription, { color: colors.text }]}
            numberOfLines={expanded ? undefined : 3}
          >
            {scheme.description}
          </Text>
          
          {expanded && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Признаки мошенничества:
                </Text>
                {scheme.warningSign && scheme.warningSign.map((sign, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <MaterialIcons name="error" size={16} color={colors.warning} />
                    <Text style={[styles.bulletText, { color: colors.text }]}>
                      {sign}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Как избежать:
                </Text>
                {scheme.howToAvoid && scheme.howToAvoid.map((tip, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <MaterialIcons name="check-circle" size={16} color={colors.success} />
                    <Text style={[styles.bulletText, { color: colors.text }]}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          <Pressable
            style={[styles.expandButton, { borderTopColor: colors.border }]}
            onPress={() => id && toggleCardExpanded(id)}
          >
            <Text style={[styles.expandButtonText, { color: colors.tint }]}>
              {expanded ? 'Свернуть' : 'Подробнее'}
            </Text>
            <MaterialIcons 
              name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={18} 
              color={colors.tint} 
            />
          </Pressable>
        </View>
      </Animated.View>
    );
  };
  
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="search-off" size={64} color={colors.muted} />
        <Text style={[styles.emptyStateText, { color: colors.text }]}>
          Ничего не найдено
        </Text>
        <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
          Попробуйте изменить параметры поиска
        </Text>
      </View>
    );
  };
  
  const renderLoadingState = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Загрузка данных...
        </Text>
      </View>
    );
  };
  
  const renderErrorState = () => {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="red" />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error}
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            setActiveTab(activeTab); // This will trigger the useEffect to fetch data again
          }}
        >
          <Text style={styles.retryButtonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  };
  
  // Button handlers instead of modal state
  const handleReportScammer = (scammer: ScammerProfile) => {
    router.push('/modals/ReportScammerModal');
  };
  
  const handleReportScheme = () => {
    router.push('/modals/ReportSchemeModal');
  };
  
  // Handler for the "Report New" button
  const handleReportNew = () => {
    if (activeTab === 'schemes') {
      router.push('/modals/ReportSchemeModal');
    } else {
      router.push('/modals/ReportScammerModal');
    }
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
        <Text style={[styles.title, { color: colors.text }]}>Мошенники</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          База данных мошенников и схем обмана
        </Text>
      </Animated.View>
      
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'schemes' && [
              styles.activeTabButton,
              { borderBottomColor: colors.tint }
            ]
          ]}
          onPress={() => setActiveTab('schemes')}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'schemes' ? colors.tint : colors.muted
              }
            ]}
          >
            Схемы мошенничества
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'scammers' && [
              styles.activeTabButton,
              { borderBottomColor: colors.tint }
            ]
          ]}
          onPress={() => setActiveTab('scammers')}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'scammers' ? colors.tint : colors.muted
              }
            ]}
          >
            База мошенников
          </Text>
        </Pressable>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.subtleBg, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={activeTab === 'schemes' ? "Поиск схем мошенничества" : "Поиск по названию или контактам"}
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
        {isLoading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          activeTab === 'schemes' ? (
            filteredSchemes && filteredSchemes.length > 0 
              ? filteredSchemes.map((scheme, index) => renderSchemeCard(scheme, index))
              : renderEmptyState()
          ) : (
            filteredScammers && filteredScammers.length > 0 
              ? filteredScammers.map((scammer, index) => renderScammerCard(scammer, index))
              : renderEmptyState()
          )
        )}
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable
          style={[styles.reportNewButton, { backgroundColor: colors.tint }]}
          onPress={handleReportNew}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.reportNewButtonText}>
            {activeTab === 'schemes' ? 'Сообщить о схеме' : 'Сообщить о мошеннике'}
          </Text>
        </Pressable>
      </View>
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
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
    paddingBottom: 80,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  reportButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  schemeTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  sectionContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  reportNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reportNewButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 