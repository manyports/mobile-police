import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Pressable, 
  Platform, 
  Animated,
  TouchableOpacity,
  Switch,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type NotificationType = 'missing' | 'case_update' | 'announcement' | 'scam_alert' | 'report_status';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  isPriority: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'missing',
    title: 'Новый розыск в вашем районе',
    message: 'Пропал ребенок (12 лет) в районе Ауэзова. Последний раз видели вчера в 18:00.',
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    isPriority: true
  },
  {
    id: '2',
    type: 'announcement',
    title: 'Важное объявление',
    message: 'Внимание! Сегодня в центре города проводятся антитеррористические учения. Сохраняйте спокойствие.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: true,
    isPriority: true
  },
  {
    id: '3',
    type: 'scam_alert',
    title: 'Новая схема мошенничества',
    message: 'Будьте внимательны: мошенники звонят от имени банка и просят продиктовать код из СМС.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: false,
    isPriority: false
  },
  {
    id: '4',
    type: 'report_status',
    title: 'Обновление по вашему заявлению',
    message: 'Ваше обращение #2023-45678 принято к рассмотрению. Ожидайте ответа в течение 48 часов.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    isPriority: false
  },
  {
    id: '5',
    type: 'case_update',
    title: 'Обновление по делу',
    message: 'Дело №2023-12345, которое вы отслеживаете, обновлено. Нажмите, чтобы узнать подробности.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: false,
    isPriority: false
  },
  {
    id: '6',
    type: 'announcement',
    title: 'Новый закон вступил в силу',
    message: 'С 1 июня вступили в силу поправки к закону о дорожном движении. Ознакомьтесь с изменениями.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true,
    isPriority: false
  },
  {
    id: '7',
    type: 'missing',
    title: 'Человек найден',
    message: 'Пропавший ранее Ахметов К. (16 лет) найден. Благодарим за содействие в поисках.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    isRead: true,
    isPriority: false
  }
];

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'missing': return 'person-search';
    case 'case_update': return 'description';
    case 'announcement': return 'campaign';
    case 'scam_alert': return 'warning';
    case 'report_status': return 'assignment';
    default: return 'notifications';
  }
};

const getColorForType = (type: NotificationType, colors: any) => {
  switch (type) {
    case 'missing': return colors.warning;
    case 'case_update': return colors.tint;
    case 'announcement': return colors.info;
    case 'scam_alert': return colors.danger;
    case 'report_status': return colors.success;
    default: return colors.text;
  }
};

const getFilterText = (type: NotificationType) => {
  switch (type) {
    case 'missing': return 'Розыск';
    case 'case_update': return 'Обновления дел';
    case 'announcement': return 'Объявления';
    case 'scam_alert': return 'Мошенники';
    case 'report_status': return 'Заявления';
    default: return '';
  }
};

const groupNotificationsByDate = (notifications: Notification[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  
  return notifications.reduce((groups, notification) => {
    const notifDate = new Date(notification.date);
    notifDate.setHours(0, 0, 0, 0);
    
    let group;
    if (notifDate.getTime() === today.getTime()) {
      group = 'Сегодня';
    } else if (notifDate.getTime() === yesterday.getTime()) {
      group = 'Вчера';
    } else if (notifDate > thisWeekStart) {
      group = 'На этой неделе';
    } else {
      group = 'Ранее';
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);
};

export default function NotificationsScreen() {
  const colors = Colors.light;
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<NotificationType[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  const filterPanelHeight = useRef(new Animated.Value(0)).current;
  
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
  
  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
    Animated.timing(filterPanelHeight, {
      toValue: filterVisible ? 0 : 220,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };
  
  const toggleFilterType = (type: NotificationType) => {
    if (activeFilters.includes(type)) {
      setActiveFilters(activeFilters.filter(t => t !== type));
    } else {
      setActiveFilters([...activeFilters, type]);
    }
  };
  
  const clearFilters = () => {
    setActiveFilters([]);
    setShowUnreadOnly(false);
    setSearchQuery('');
  };
  
  const filteredNotifications = notifications.filter(notification => {
    // Filter by search query
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by notification type
    if (activeFilters.length > 0 && !activeFilters.includes(notification.type)) {
      return false;
    }
    
    // Filter by read/unread status
    if (showUnreadOnly && notification.isRead) {
      return false;
    }
    
    return true;
  });
  
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const groupOrder = ['Сегодня', 'Вчера', 'На этой неделе', 'Ранее'];
  
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <Pressable
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: item.isRead ? colors.cardBg : colors.subtleBg,
          borderLeftColor: getColorForType(item.type, colors),
          borderLeftWidth: 4
        }
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: getColorForType(item.type, colors) + '20' }
      ]}>
        <MaterialIcons 
          name={getIconForType(item.type)} 
          size={24} 
          color={getColorForType(item.type, colors)} 
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          {item.isPriority && (
            <View style={[styles.priorityBadge, { backgroundColor: colors.danger }]}>
              <Text style={styles.priorityText}>Срочно</Text>
            </View>
          )}
        </View>
        
        <Text 
          style={[styles.notificationMessage, { color: colors.muted }]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        
        <View style={styles.notificationFooter}>
          <Text style={[styles.notificationDate, { color: colors.muted }]}>
            {new Date(item.date).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short'
            })}
          </Text>
          
          {!item.isRead && (
            <View style={[styles.unreadIndicator, { backgroundColor: colors.tint }]} />
          )}
        </View>
      </View>
    </Pressable>
  );

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
        <Text style={[styles.title, { color: colors.text }]}>Уведомления</Text>
        <View style={styles.headerActions}>
          {notifications.some(n => !n.isRead) && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <Text style={[styles.headerButtonText, { color: colors.tint }]}>
                Прочитать все
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleFilter}
          >
            <MaterialIcons 
              name="filter-list" 
              size={24} 
              color={filterVisible || activeFilters.length > 0 || showUnreadOnly ? colors.tint : colors.muted} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.filterPanel, { height: filterPanelHeight }]}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Поиск в уведомлениях"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={[styles.filterSectionTitle, { color: colors.muted }]}>Типы уведомлений</Text>
        
        <View style={styles.filterChips}>
          {(['missing', 'case_update', 'announcement', 'scam_alert', 'report_status'] as NotificationType[]).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: activeFilters.includes(type) 
                    ? getColorForType(type, colors) + '20' 
                    : colors.subtleBg,
                  borderColor: activeFilters.includes(type)
                    ? getColorForType(type, colors)
                    : colors.border
                }
              ]}
              onPress={() => toggleFilterType(type)}
            >
              <MaterialIcons 
                name={getIconForType(type)} 
                size={16} 
                color={getColorForType(type, colors)} 
              />
              <Text style={[
                styles.filterChipText, 
                { 
                  color: activeFilters.includes(type) 
                    ? getColorForType(type, colors) 
                    : colors.muted 
                }
              ]}>
                {getFilterText(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.filterSwitchRow}>
          <Text style={[styles.filterSwitchLabel, { color: colors.text }]}>
            Только непрочитанные
          </Text>
          <Switch
            value={showUnreadOnly}
            onValueChange={setShowUnreadOnly}
            trackColor={{ false: colors.border, true: colors.tint + '70' }}
            thumbColor={showUnreadOnly ? colors.tint : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.clearFiltersButton, { borderColor: colors.border }]}
          onPress={clearFilters}
        >
          <Text style={[styles.clearFiltersText, { color: colors.muted }]}>
            Сбросить фильтры
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-off" size={64} color={colors.muted} />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            Уведомлений нет
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
            {activeFilters.length > 0 || showUnreadOnly || searchQuery 
              ? 'Попробуйте изменить параметры фильтрации'
              : 'Когда появятся новые уведомления, вы увидите их здесь'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupOrder.filter(group => groupedNotifications[group]?.length > 0)}
          keyExtractor={item => item}
          renderItem={({ item: groupName }) => (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                {groupName}
              </Text>
              {groupedNotifications[groupName].map(notification => 
                <React.Fragment key={notification.id}>
                  {renderNotificationItem({ item: notification })}
                </React.Fragment>
              )}
            </View>
          )}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterPanel: {
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterSwitchLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearFiltersButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationDate: {
    fontSize: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
}); 