import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  Platform, 
  Animated, 
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  date: string;
  type: string;
}

export default function ReportsScreen() {
  const colors = Colors.light;
  const [activeTab, setActiveTab] = useState('my');
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Повреждение дорожного знака',
      description: 'На перекрестке ул. Абая и Достык поврежден дорожный знак пешеходного перехода',
      status: 'in_progress',
      date: '15.05.2023',
      type: 'Инфраструктура'
    },
    {
      id: '2',
      title: 'Шумные соседи',
      description: 'Постоянный шум после 23:00 с квартиры этажом выше',
      status: 'pending',
      date: '20.05.2023',
      type: 'Нарушение порядка'
    },
    {
      id: '3',
      title: 'Подозрительная активность',
      description: 'Неизвестные люди регулярно собираются в заброшенном здании по ул. Сатпаева, 25',
      status: 'resolved',
      date: '10.04.2023',
      type: 'Безопасность'
    }
  ]);
  
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');
  const [newReportType, setNewReportType] = useState('Выберите тип');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  
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
  
  const reportTypes = [
    'Безопасность', 
    'Нарушение порядка', 
    'Инфраструктура', 
    'Дорожное движение', 
    'Мошенничество',
    'Другое'
  ];
  
  const handleSubmitReport = () => {
    if (!newReportTitle.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите тему обращения');
      return;
    }
    
    if (!newReportDescription.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите описание проблемы');
      return;
    }
    
    if (newReportType === 'Выберите тип') {
      Alert.alert('Ошибка', 'Пожалуйста, выберите тип обращения');
      return;
    }
    
    const newReport: Report = {
      id: Date.now().toString(),
      title: newReportTitle,
      description: newReportDescription,
      status: 'pending',
      date: new Date().toLocaleDateString('ru-RU'),
      type: newReportType
    };
    
    setReports([newReport, ...reports]);
    setNewReportTitle('');
    setNewReportDescription('');
    setNewReportType('Выберите тип');
    setActiveTab('my');
    
    Alert.alert(
      'Успешно',
      'Ваше обращение было зарегистрировано. Номер обращения: ' + newReport.id,
      [{ text: 'OK' }]
    );
  };
  
  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'На рассмотрении';
      case 'in_progress': return 'В работе';
      case 'resolved': return 'Решено';
      default: return '';
    }
  };
  
  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'in_progress': return colors.tint;
      case 'resolved': return colors.success;
      default: return colors.text;
    }
  };
  
  const renderMyReports = () => {
    if (reports.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="description" size={64} color={colors.muted} />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            У вас пока нет обращений
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
            Создайте новое обращение на вкладке "Создать"
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView
        style={styles.reportsContainer}
        contentContainerStyle={styles.reportsContent}
        showsVerticalScrollIndicator={false}
      >
        {reports.map((report, index) => {
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
              key={report.id}
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
                  styles.reportCard, 
                  { 
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border
                  }
                ]}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportTitleContainer}>
                    <Text style={[styles.reportTitle, { color: colors.text }]}>
                      {report.title}
                    </Text>
                    <Text style={[styles.reportDate, { color: colors.muted }]}>
                      {report.date}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.statusBadge, 
                      { backgroundColor: getStatusColor(report.status) + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.statusText, 
                        { color: getStatusColor(report.status) }
                      ]}
                    >
                      {getStatusText(report.status)}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.reportType, { color: colors.muted }]}>
                  {report.type}
                </Text>
                
                <Text style={[styles.reportDescription, { color: colors.text }]}>
                  {report.description}
                </Text>
                
                <Pressable
                  style={[styles.detailsButton, { borderColor: colors.border }]}
                  onPress={() => {
                    Alert.alert(
                      'Информация по обращению',
                      `Номер: ${report.id}\nСтатус: ${getStatusText(report.status)}\nДата: ${report.date}\nТип: ${report.type}`,
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <Text style={[styles.detailsButtonText, { color: colors.tint }]}>
                    Подробнее
                  </Text>
                  <MaterialIcons name="chevron-right" size={16} color={colors.tint} />
                </Pressable>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    );
  };
  
  const renderNewReportForm = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Тема обращения
            </Text>
            <TextInput
              style={[
                styles.textInput, 
                { 
                  backgroundColor: colors.subtleBg,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Введите тему обращения"
              placeholderTextColor={colors.muted}
              value={newReportTitle}
              onChangeText={setNewReportTitle}
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Тип обращения
            </Text>
            <Pressable
              style={[
                styles.selector, 
                { 
                  backgroundColor: colors.subtleBg,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => setShowTypeSelector(!showTypeSelector)}
            >
              <Text 
                style={[
                  styles.selectorText, 
                  {
                    color: newReportType === 'Выберите тип' 
                      ? colors.muted 
                      : colors.text
                  }
                ]}
              >
                {newReportType}
              </Text>
              <MaterialIcons 
                name={showTypeSelector ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color={colors.muted} 
              />
            </Pressable>
            
            {showTypeSelector && (
              <View 
                style={[
                  styles.dropdownContainer, 
                  { 
                    backgroundColor: colors.subtleBg,
                    borderColor: colors.border 
                  }
                ]}
              >
                {reportTypes.map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.dropdownItem,
                      type === newReportType && {
                        backgroundColor: colors.tint + '20'
                      }
                    ]}
                    onPress={() => {
                      setNewReportType(type);
                      setShowTypeSelector(false);
                    }}
                  >
                    <Text 
                      style={[
                        styles.dropdownItemText, 
                        { 
                          color: type === newReportType 
                            ? colors.tint 
                            : colors.text 
                        }
                      ]}
                    >
                      {type}
                    </Text>
                    {type === newReportType && (
                      <MaterialIcons name="check" size={18} color={colors.tint} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Описание проблемы
            </Text>
            <TextInput
              style={[
                styles.textAreaInput, 
                { 
                  backgroundColor: colors.subtleBg,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Подробно опишите проблему, указав адрес, время и другие важные детали"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              numberOfLines={6}
              value={newReportDescription}
              onChangeText={setNewReportDescription}
            />
          </View>
          
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmitReport}
          >
            <Text style={styles.submitButtonText}>Отправить обращение</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
        <Text style={[styles.title, { color: colors.text }]}>Обращения</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Подача и отслеживание обращений
        </Text>
      </Animated.View>
      
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'my' && [
              styles.activeTabButton,
              { borderBottomColor: colors.tint }
            ]
          ]}
          onPress={() => setActiveTab('my')}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'my' ? colors.tint : colors.muted
              }
            ]}
          >
            Мои обращения
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'new' && [
              styles.activeTabButton,
              { borderBottomColor: colors.tint }
            ]
          ]}
          onPress={() => setActiveTab('new')}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'new' ? colors.tint : colors.muted
              }
            ]}
          >
            Создать
          </Text>
        </Pressable>
      </View>
      
      {activeTab === 'my' ? renderMyReports() : renderNewReportForm()}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  reportsContainer: {
    flex: 1,
  },
  reportsContent: {
    padding: 16,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportType: {
    fontSize: 14,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 120,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectorText: {
    fontSize: 16,
  },
  dropdownContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 