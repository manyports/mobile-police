import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Animated, 
  Platform,
  useWindowDimensions,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, Href } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface FeatureItem {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  path: Href;
  color: string;
}

const FEATURES: FeatureItem[] = [
  { 
    title: 'Карта',
    icon: 'map',
    path: '/(tabs)/map' as Href,
    color: '#4285F4',
  },
  { 
    title: 'Обращения',
    icon: 'description',
    path: '/(tabs)/reports' as Href,
    color: '#34A853',
  },
  { 
    title: 'Розыск',
    icon: 'person-search',
    path: '/(tabs)/missing' as Href,
    color: '#FBBC05',
  },
  { 
    title: 'Мошенники',
    icon: 'security',
    path: '/(tabs)/scammers' as Href,
    color: '#EA4335',
  }
];

const QUICK_ACTIONS = [
  {
    title: 'Вызов',
    icon: 'phone',
  },
  {
    title: 'Сообщить',
    icon: 'chat',
  },
  {
    title: 'Помощь',
    icon: 'help-outline',
  }
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          <View style={styles.headerRow}>
            <View />
            <View style={styles.headerActions}>
              <Link href="/profile" asChild>
                <Pressable style={styles.iconButton}>
                  <MaterialIcons name="settings" size={22} color="#333" />
                </Pressable>
              </Link>
              
              <Link href="/profile" asChild>
                <Pressable style={styles.iconButton}>
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>2</Text>
                  </View>
                  <MaterialIcons name="notifications-none" size={22} color="#333" />
                </Pressable>
              </Link>
            </View>
          </View>
          
          <View style={styles.serviceCard}>
            <Text style={styles.serviceCardTitle}>ПЛАТФОРМА БЕЗОПАСНОСТИ</Text>
            <View style={styles.serviceCardTopRow}>
              <Text style={styles.serviceCardLabel}>QALQAN BETA</Text>
              <MaterialIcons name="verified" size={18} color="#4285F4" />
            </View>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            marginTop: 16
          }}
        >
          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <Link key={feature.title} href={feature.path} asChild>
                <Pressable style={styles.featureItem}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name={feature.icon} size={28} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </Animated.View>
        
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            marginTop: 24
          }}
        >
          <Link href="/(tabs)/emergency" asChild>
            <Pressable style={styles.bannerCard}>
              <View style={styles.bannerCardContent}>
                <View>
                  <Text style={styles.bannerTitle}>Экстренная помощь</Text>
                  <Text style={styles.bannerSubtitle}>В случае опасности нажмите кнопку SOS</Text>
                </View>
                
                <View style={styles.sosButtonSmall}>
                  <Text style={styles.sosButtonText}>SOS</Text>
                </View>
              </View>
            </Pressable>
          </Link>
        </Animated.View>
        
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            marginTop: 24
          }}
        >
          <View style={styles.quickActionsContainer}>
            {QUICK_ACTIONS.map((action, index) => (
              <Pressable key={action.title} style={styles.quickAction}>
                <View style={styles.quickActionIconContainer}>
                  <MaterialIcons name={action.icon as any} size={22} color="#333" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
        
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            marginTop: 24
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Новости</Text>
            <Pressable>
              <Text style={styles.viewAllText}>Все новости</Text>
            </Pressable>
          </View>
          
          <View style={styles.newsCard}>
            <Text style={styles.newsDate}>10 СЕНТЯБРЯ</Text>
            <Text style={styles.newsTitle}>
              Усиление мер безопасности в общественных местах
            </Text>
          </View>
          
          <View style={styles.newsCard}>
            <Text style={styles.newsDate}>5 СЕНТЯБРЯ</Text>
            <Text style={styles.newsTitle}>
              Запуск нового формата работы участковых инспекторов
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#EA4335',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  serviceCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4285F4',
    marginRight: 8,
  },
  serviceCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  bannerCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bannerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  sosButtonSmall: {
    backgroundColor: '#EA4335',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sosButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4285F4',
  },
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  newsDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
}); 