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
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ScammerProfile {
  id: string;
  name: string;
  type: 'phone' | 'online' | 'financial' | 'other';
  description: string;
  contactInfo: string;
  additionalInfo?: string;
  dateAdded: string;
}

interface ScamScheme {
  id: string;
  title: string;
  description: string;
  warningSign: string[];
  howToAvoid: string[];
}

export default function ScammersScreen() {
  const colors = Colors.light;
  const [activeTab, setActiveTab] = useState('schemes');
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
  
  const scammers: ScammerProfile[] = [
    {
      id: '1',
      name: 'ТОО "КазИнвест"',
      type: 'financial',
      description: 'Предлагают быстрый доход от инвестиций в "эксклюзивный" проект. Обещают доходность 30% в месяц.',
      contactInfo: '+7 (777) 123-4567, invest@kazinvest-fake.kz',
      additionalInfo: 'Используют поддельные документы с государственными печатями.',
      dateAdded: '10.05.2023'
    },
    {
      id: '2',
      name: 'Аскар Мамедов',
      type: 'online',
      description: 'Выдает себя за сотрудника банка и просит данные карт для "проверки безопасности".',
      contactInfo: '+7 (702) 987-6543, различные аккаунты в социальных сетях',
      dateAdded: '15.04.2023'
    },
    {
      id: '3',
      name: '+7 (708) 555-1234',
      type: 'phone',
      description: 'Звонят с сообщением о блокировке банковской карты и просят провести операцию через банкомат.',
      contactInfo: '+7 (708) 555-1234',
      dateAdded: '02.05.2023'
    },
    {
      id: '4',
      name: 'support@nationalbank-kz.com',
      type: 'online',
      description: 'Фишинговые письма от имени Национального Банка с требованием обновить данные.',
      contactInfo: 'support@nationalbank-kz.com',
      additionalInfo: 'Настоящий домен нацбанка - nationalbank.kz',
      dateAdded: '20.04.2023'
    },
    {
      id: '5',
      name: 'ИП "Курьерская доставка"',
      type: 'other',
      description: 'Берут предоплату за доставку несуществующих товаров.',
      contactInfo: '+7 (747) 456-7890, delivery@express-fake.kz',
      dateAdded: '05.05.2023'
    }
  ];
  
  const scamSchemes: ScamScheme[] = [
    {
      id: '1',
      title: 'Звонок из "службы безопасности банка"',
      description: 'Мошенники звонят и представляются сотрудниками службы безопасности банка. Сообщают о подозрительной операции и под предлогом защиты средств выманивают данные карты, коды из СМС или просят перевести деньги на "безопасный счет".',
      warningSign: [
        'Просьба сообщить полные данные карты',
        'Требование назвать код из СМС или пароль',
        'Создание атмосферы срочности и паники',
        'Запрет на обращение напрямую в банк'
      ],
      howToAvoid: [
        'Всегда перезванивайте в банк по официальному номеру с сайта или карты',
        'Никогда не сообщайте CVV-код, полный номер карты или коды из СМС',
        'Помните, что настоящие сотрудники банка никогда не запрашивают пароли'
      ]
    },
    {
      id: '2',
      title: 'Фальшивые интернет-магазины',
      description: 'Мошенники создают поддельные сайты интернет-магазинов с привлекательными ценами. После оплаты товар не доставляется, а сайт исчезает.',
      warningSign: [
        'Подозрительно низкие цены',
        'Отсутствие контактной информации',
        'Требование предоплаты на карту физлица',
        'Ошибки на сайте, некачественные фото товаров'
      ],
      howToAvoid: [
        'Проверяйте отзывы о магазине на независимых ресурсах',
        'Сравнивайте домен с официальным',
        'Предпочитайте оплату при получении или через надежные платежные системы',
        'Изучите дату регистрации домена'
      ]
    },
    {
      id: '3',
      title: 'Инвестиционные пирамиды',
      description: 'Схемы, обещающие необычайно высокую доходность. Используют деньги новых инвесторов для выплат старым, пока система не рухнет.',
      warningSign: [
        'Гарантия высокого дохода без риска',
        'Обещание доходности выше рыночной (от 15% в месяц)',
        'Отсутствие прозрачной информации о компании',
        'Системы с необходимостью приглашения новых участников'
      ],
      howToAvoid: [
        'Проверяйте наличие лицензии на финансовую деятельность',
        'Не доверяйте обещаниям гарантированной доходности',
        'Изучайте финансовую модель компании',
        'Проверяйте информацию в реестре юридических лиц'
      ]
    },
    {
      id: '4',
      title: 'Фишинговые сообщения',
      description: 'Поддельные электронные письма или сообщения, имитирующие коммуникацию от банков, госорганов или известных сервисов, с целью получить конфиденциальные данные.',
      warningSign: [
        'Сообщения о блокировке аккаунта или проблемах с безопасностью',
        'Ссылки на сайты с похожими, но не идентичными адресами',
        'Требование срочно обновить данные или войти в личный кабинет',
        'Орфографические и грамматические ошибки'
      ],
      howToAvoid: [
        'Проверяйте адрес отправителя письма',
        'Не переходите по ссылкам из подозрительных писем',
        'Вводите адреса сайтов вручную в браузере',
        'Используйте двухфакторную аутентификацию'
      ]
    },
    {
      id: '5',
      title: 'Мошенничество в сфере аренды жилья',
      description: 'Мошенники размещают объявления о сдаче несуществующих квартир или квартир, которыми не владеют, и требуют предоплату.',
      warningSign: [
        'Цена значительно ниже рыночной',
        'Отказ от личной встречи или показа квартиры',
        'Требование предоплаты до заключения договора',
        'Отсутствие документов на собственность'
      ],
      howToAvoid: [
        'Всегда осматривайте жилье лично перед оплатой',
        'Проверяйте документы на собственность',
        'Заключайте официальный договор аренды',
        'Не переводите деньги до подписания документов'
      ]
    }
  ];
  
  const filteredScammers = scammers.filter(scammer => 
    scammer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scammer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scammer.contactInfo.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSchemes = scamSchemes.filter(scheme => 
    scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderScammerCard = (scammer: ScammerProfile, index: number) => {
    const itemAnimationValue = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(itemAnimationValue, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);
    
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
    
    return (
      <Animated.View
        key={scammer.id}
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
              onPress={() => {
                Alert.alert(
                  'Сообщить о подозрительной активности',
                  'Для отправки дополнительной информации об этом мошеннике или для сообщения о новой схеме мошенничества, пожалуйста, обратитесь по номеру 102 или через электронное обращение в полицию.',
                  [
                    { text: 'Отмена', style: 'cancel' },
                    { 
                      text: 'Позвонить 102',
                      onPress: () => Linking.openURL('tel:102')
                    }
                  ]
                );
              }}
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
    const itemAnimationValue = useRef(new Animated.Value(0)).current;
    const [expanded, setExpanded] = useState(false);
    
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
        key={scheme.id}
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
            onPress={() => setExpanded(!expanded)}
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
                {scheme.warningSign.map((sign, i) => (
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
                {scheme.howToAvoid.map((tip, i) => (
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
            onPress={() => setExpanded(!expanded)}
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
        {activeTab === 'schemes' && (
          filteredSchemes.length > 0 
            ? filteredSchemes.map((scheme, index) => renderSchemeCard(scheme, index))
            : renderEmptyState()
        )}
        
        {activeTab === 'scammers' && (
          filteredScammers.length > 0 
            ? filteredScammers.map((scammer, index) => renderScammerCard(scammer, index))
            : renderEmptyState()
        )}
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable
          style={[styles.reportNewButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            Alert.alert(
              activeTab === 'schemes' 
                ? 'Сообщить о новой схеме' 
                : 'Сообщить о мошеннике',
              'Для подачи заявления о мошенничестве или сообщения о новой схеме обмана, обратитесь в ближайший отдел полиции или позвоните по номеру 102.',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Позвонить 102',
                  onPress: () => Linking.openURL('tel:102')
                }
              ]
            );
          }}
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
}); 