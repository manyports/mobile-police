import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Platform, 
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';

type MapMode = 'incidents' | 'police-stations' | 'user-reports';

interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'theft' | 'violence' | 'vandalism' | 'fraud' | 'other';
  date: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface PoliceStation {
  id: string;
  title: string;
  address: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function MapScreen() {
  const colors = Colors.light;
  const mapRef = useRef<MapView>(null);
  const { width, height } = Dimensions.get('window');
  
  const [region, setRegion] = useState({
    latitude: 43.238949,
    longitude: 76.889709,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [mapMode, setMapMode] = useState<MapMode>('incidents');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  
  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Кража в торговом центре',
      description: 'Сообщается о краже личных вещей в ТЦ "Мега"',
      type: 'theft',
      date: '21.09.2023',
      location: {
        latitude: 43.2580,
        longitude: 76.9150,
      },
    },
    {
      id: '2',
      title: 'Вандализм в парке',
      description: 'Повреждение городской инфраструктуры в Центральном парке',
      type: 'vandalism',
      date: '18.09.2023',
      location: {
        latitude: 43.2520,
        longitude: 76.9100,
      },
    },
    {
      id: '3',
      title: 'Мошенничество',
      description: 'Зафиксирован случай мошенничества с банковскими картами',
      type: 'fraud',
      date: '15.09.2023',
      location: {
        latitude: 43.2540,
        longitude: 76.9200,
      },
    },
  ];
  
  const policeStations: PoliceStation[] = [
    {
      id: '1',
      title: 'Полицейский участок №1',
      address: 'ул. Абая, 123',
      phone: '+7 (777) 123-45-67',
      location: {
        latitude: 43.238949,
        longitude: 76.889709,
      },
    },
    {
      id: '2',
      title: 'Полицейский участок №2',
      address: 'пр. Достык, 456',
      phone: '+7 (777) 765-43-21',
      location: {
        latitude: 43.248949,
        longitude: 76.899709,
      },
    },
    {
      id: '3',
      title: 'Полицейский участок №3',
      address: 'ул. Толе би, 789',
      phone: '+7 (777) 987-65-43',
      location: {
        latitude: 43.228949,
        longitude: 76.879709,
      },
    },
    {
      id: '4',
      title: 'Центральный отдел полиции УП г. Караганды',
      address: 'Терешковой, 36',
      phone: '+7 (7212) 51‒06‒91',
      location: {
        latitude: 49.819,
        longitude: 73.108498,
      },
    },
    {
      id: '5',
      title: 'Михайловский отдел полиции УП г. Караганды',
      address: 'Крылова, 10',
      phone: '+7 (7212) 40‒78‒20',
      location: {
        latitude: 49.813389,
        longitude: 73.143219,
      },
    },
    {
      id: '6',
      title: 'Юго-Восточный отдел полиции УП г. Караганды',
      address: 'Гапеева, 7',
      phone: '+7 (7212) 40‒78‒70',
      location: {
        latitude: 49.769293,
        longitude: 73.156700,
      },
    },
  ];
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
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
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Доступ к местоположению не был предоставлен');
          setLoading(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        
        setLoading(false);
      } catch (err) {
        setError('Не удалось получить текущее местоположение');
        setLoading(false);
      }
    })();
  }, []);
  
  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        if (!mapRef.current) {
          setError('Ошибка загрузки карты. Пожалуйста, попробуйте снова.');
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);
  
  const getMarkerColor = (type: Incident['type']) => {
    switch (type) {
      case 'theft':
        return '#F43F5E';
      case 'violence':
        return '#8B5CF6'; 
      case 'vandalism':
        return '#F59E0B';
      case 'fraud':
        return '#3B82F6';
      default:
        return '#6B7280'; 
    }
  };
  
  const getMarkerIcon = (type: Incident['type']) => {
    switch (type) {
      case 'theft':
        return 'shopping-bag';
      case 'violence':
        return 'person';
      case 'vandalism':
        return 'construction';
      case 'fraud':
        return 'credit-card';
      default:
        return 'warning';
    }
  };
  
  const renderMarkers = () => {
    try {
      if (mapMode === 'incidents') {
        return incidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={incident.location}
            tracksViewChanges={false}
            onPress={() => setSelectedMarker(incident.id)}
          >
            <View style={[
              styles.customMarker, 
              { backgroundColor: selectedMarker === incident.id 
                ? getMarkerColor(incident.type) + 'DD' 
                : getMarkerColor(incident.type) + '99' }
            ]}>
              {selectedMarker === incident.id && (
                <Animated.View
                  style={[
                    styles.markerRing,
                    {
                      borderColor: getMarkerColor(incident.type),
                      opacity: pulseAnim,
                      transform: [
                        { scale: Animated.multiply(pulseAnim, 1.3) }
                      ],
                    }
                  ]}
                />
              )}
              <MaterialIcons 
                name={getMarkerIcon(incident.type) as any} 
                size={16} 
                color="white" 
              />
            </View>
            <Callout tooltip>
              <View style={[
                styles.calloutContainer, 
                { backgroundColor: colors.cardBg }
              ]}>
                <Text style={[styles.calloutTitle, { color: colors.text }]}>
                  {incident.title}
                </Text>
                <Text style={[styles.calloutDescription, { color: colors.muted }]}>
                  {incident.description}
                </Text>
                <Text style={[styles.calloutDate, { color: colors.tint }]}>
                  {incident.date}
                </Text>
              </View>
            </Callout>
          </Marker>
        ));
      } else if (mapMode === 'police-stations') {
        return policeStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={station.location}
            tracksViewChanges={false}
            onPress={() => setSelectedMarker(station.id)}
          >
            <View style={[
              styles.stationMarker, 
              { backgroundColor: selectedMarker === station.id 
                ? colors.tint + 'DD' 
                : colors.tint + '99' 
              }
            ]}>
              {selectedMarker === station.id && (
                <Animated.View
                  style={[
                    styles.markerRing,
                    {
                      borderColor: colors.tint,
                      opacity: pulseAnim,
                      transform: [
                        { scale: Animated.multiply(pulseAnim, 1.3) }
                      ],
                    }
                  ]}
                />
              )}
              <MaterialIcons 
                name="local-police" 
                size={16} 
                color="white" 
              />
            </View>
            <Callout tooltip>
              <View style={[
                styles.calloutContainer, 
                { backgroundColor: colors.cardBg }
              ]}>
                <Text style={[styles.calloutTitle, { color: colors.text }]}>
                  {station.title}
                </Text>
                <Text style={[styles.calloutDescription, { color: colors.muted }]}>
                  {station.address}
                </Text>
                <Text style={[styles.calloutPhone, { color: colors.tint }]}>
                  {station.phone}
                </Text>
              </View>
            </Callout>
          </Marker>
        ));
      }
      return null;
    } catch (err) {
      console.error('Error rendering markers:', err);
      return null;
    }
  };
  
  const navigateToUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось получить текущее местоположение');
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Загрузка карты...
        </Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <MaterialIcons name="error-outline" size={48} color={colors.tint} />
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <Pressable 
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => {
            setLoading(true);
            setError(null);
            (async () => {
              try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                
                if (status !== 'granted') {
                  setError('Доступ к местоположению не был предоставлен');
                  setLoading(false);
                  return;
                }
                
                const location = await Location.getCurrentPositionAsync({});
                
                setRegion({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                });
                
                setLoading(false);
              } catch (err) {
                setError('Не удалось получить текущее местоположение');
                setLoading(false);
              }
            })();
          }}
        >
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        region={region}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsCompass={false}
        onRegionChangeComplete={setRegion}
      >
        {renderMarkers()}
      </MapView>

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
          <BlurView 
            intensity={80} 
            tint="light"
            style={styles.headerBlur}
          >
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {mapMode === 'incidents' ? 'Карта происшествий' : 'Отделения полиции'}
            </Text>
          </BlurView>
        ) : (
          <View style={[styles.header, { backgroundColor: colors.background + 'DD' }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {mapMode === 'incidents' ? 'Карта происшествий' : 'Отделения полиции'}
            </Text>
          </View>
        )}
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.modeSelectorContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateY }],
          }
        ]}
      >
        <View style={[
          styles.modeSelector, 
          { 
            backgroundColor: 'rgba(255, 255, 255, 0.9)' 
          }
        ]}>
          <Pressable
            style={[
              styles.modeButton,
              mapMode === 'incidents' && { 
                backgroundColor: colors.tint,
                shadowColor: colors.tint, 
                shadowOpacity: 0.5,
              }
            ]}
            onPress={() => setMapMode('incidents')}
          >
            <MaterialIcons 
              name="warning" 
              size={20} 
              color={mapMode === 'incidents' ? 'white' : colors.text} 
            />
          </Pressable>
          
          <Pressable
            style={[
              styles.modeButton,
              mapMode === 'police-stations' && { 
                backgroundColor: colors.tint,
                shadowColor: colors.tint, 
                shadowOpacity: 0.5,
              }
            ]}
            onPress={() => setMapMode('police-stations')}
          >
            <MaterialIcons 
              name="local-police" 
              size={20}
              color={mapMode === 'police-stations' ? 'white' : colors.text} 
            />
          </Pressable>
        </View>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.locationButtonContainer,
          {
            transform: [{ scale: buttonScale }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Pressable
          style={[
            styles.locationButton,
            { 
              backgroundColor: 'white',
              borderColor: colors.border,
            }
          ]}
          onPress={navigateToUserLocation}
        >
          <MaterialIcons 
            name="my-location" 
            size={22} 
            color={colors.tint} 
          />
        </Pressable>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.infoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(translateY, -1) }],
          }
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView 
            intensity={80} 
            tint="light"
            style={styles.infoBlur}
          >
            <Text style={[styles.infoText, { color: colors.text }]}>
              {mapMode === 'incidents' 
                ? 'Нажмите на маркер, чтобы увидеть детали происшествия' 
                : 'Нажмите на маркер, чтобы увидеть контакты отделения'
              }
            </Text>
          </BlurView>
        ) : (
          <View style={[styles.infoPanel, { backgroundColor: colors.background + 'DD' }]}>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {mapMode === 'incidents' 
                ? 'Нажмите на маркер, чтобы увидеть детали происшествия' 
                : 'Нажмите на маркер, чтобы увидеть контакты отделения'
              }
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  headerBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  header: {
    borderRadius: 16,
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modeSelectorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 110,
    left: 24,
    zIndex: 10,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  locationButtonContainer: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    zIndex: 10,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  infoBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
  },
  infoPanel: {
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  calloutContainer: {
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  calloutDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  calloutPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 