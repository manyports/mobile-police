import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  StyleSheet, 
  View, 
  Platform, 
  Pressable, 
  Text, 
  Modal, 
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const MORE_MENU_ITEMS = [
  { 
    name: 'reports', 
    title: 'Обращения', 
    icon: 'description',
    desc: 'Подача и отслеживание обращений'
  },
  { 
    name: 'missing', 
    title: 'Розыск', 
    icon: 'person-search',
    desc: 'Поиск пропавших лиц'
  },
  { 
    name: 'scammers', 
    title: 'Мошенники', 
    icon: 'block',
    desc: 'База данных мошенников'
  },
  { 
    name: 'profile', 
    title: 'Профиль', 
    icon: 'person',
    desc: 'Настройки и личные данные'
  }
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = Colors.light;
  const { width } = Dimensions.get('window');
  
  return (
    <View style={[
      styles.tabBarContainer, 
      {
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      }
    ]}>
      {state.routes.slice(0, 4).map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;
        
        let icon;
        if (route.name === 'index') {
          icon = <MaterialIcons name="home" size={26} color={isFocused ? colors.tint : colors.tabIconDefault} />;
        } else if (route.name === 'map') {
          icon = <MaterialIcons name="map" size={26} color={isFocused ? colors.tint : colors.tabIconDefault} />;
        } else if (route.name === 'emergency') {
          icon = <MaterialIcons name="warning" size={26} color={colors.danger} />;
        } else if (route.name === 'more') {
          icon = <MaterialIcons name="more-horiz" size={26} color={isFocused ? colors.tint : colors.tabIconDefault} />;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
      
        const itemWidth = width / 4;
        const left = index * itemWidth;

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            style={[
              styles.tabItem,
              {
                width: itemWidth,
                left: left,
              }
            ]}
          >
            {icon}
            <Text style={[
              styles.tabLabel, 
              { 
                color: isFocused 
                  ? route.name === 'emergency' 
                    ? colors.danger 
                    : colors.tint 
                  : colors.tabIconDefault 
              }
            ]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const colors = Colors.light;
  const router = useRouter();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;

  const openMoreMenu = () => {
    setMoreMenuVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeMoreMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setMoreMenuVisible(false);
    });
  };

  const navigateToScreen = (screenName: string) => {
    closeMoreMenu();
    router.navigate(screenName as any);
  };

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Главная',
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Карта',
          }}
        />
        <Tabs.Screen
          name="emergency"
          options={{
            title: 'SOS',
          }}
        />
        <Tabs.Screen
          name="more"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openMoreMenu();
            },
          }}
          options={{
            title: 'Ещё',
          }}
        />

        <Tabs.Screen
          name="reports"
          options={{
            title: 'Обращения',
            tabBarButton: () => null,
            tabBarIcon: ({ color, size }) => <MaterialIcons name="description" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="missing"
          options={{
            title: 'Розыск',
            tabBarButton: () => null,
            tabBarIcon: ({ color, size }) => <MaterialIcons name="person-search" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="scammers"
          options={{
            title: 'Мошенники',
            tabBarButton: () => null,
            tabBarIcon: ({ color, size }) => <MaterialIcons name="block" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarButton: () => null,
            tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
      <Modal
        animationType="none"
        transparent={true}
        visible={moreMenuVisible}
        onRequestClose={closeMoreMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMoreMenu}>
          <Animated.View 
            style={[
              styles.moreMenuContainer, 
              { 
                backgroundColor: colors.background,
                opacity: fadeAnim,
                transform: [{ translateY }]
              }
            ]}
          >
            <View style={styles.moreMenuHeader}>
              <Text style={[styles.moreMenuTitle, { color: colors.text }]}>Дополнительные функции</Text>
              <TouchableOpacity 
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}} 
                onPress={closeMoreMenu}
              >
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItemsContainer}>
              {MORE_MENU_ITEMS.map((item) => (
                <TouchableOpacity 
                  key={item.name} 
                  style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                  onPress={() => navigateToScreen(item.name)}
                >
                  <MaterialIcons name={item.icon as any} size={24} color={colors.tint} />
                  <View style={styles.menuItemTextContainer}>
                    <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.menuItemDesc, { color: colors.muted }]}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  moreMenuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    elevation: 5,
    maxHeight: '80%',
  },
  moreMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  moreMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  menuItemsContainer: {
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  tabBarContainer: {
    height: Platform.OS === 'ios' ? 88 : 60,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
    width: '100%',
    position: 'relative',
  },
  tabItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
});
