import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Determine if we're running in Expo development environment
const isExpoDevelopment = () => {
  return Constants?.executionEnvironment === 'storeClient' ||
    Constants?.executionEnvironment === 'standalone' ||
    Constants?.manifest?.packagerOpts?.dev === true ||
    process.env.NODE_ENV === 'development';
};

// Network detection utility
class NetworkInfo {
  // Default fallback IP - update to use localhost instead
  static defaultIp = 'localhost';
  
  // These values are specific to different environments
  static iosSimulatorHost = 'localhost';
  static androidEmulatorHost = '10.0.2.2';
  
  // Detect if running on an emulator/simulator
  static isEmulator() {
    if (Platform.OS === 'ios') {
      // iOS simulator detection - safely check if utsname exists
      const utsname = Platform.constants?.utsname;
      return utsname && utsname.machine && utsname.machine.toLowerCase().includes('simulator');
    } else if (Platform.OS === 'android') {
      // Android emulator detection
      return (
        NativeModules?.DeviceInfo?.isEmulator ||
        NativeModules?.RNDeviceInfo?.isEmulator ||
        false
      );
    }
    return false;
  }
  
  // Get the appropriate host based on environment
  static getAppropriateHost(specifiedHost) {
    // If user specified host, use it
    if (specifiedHost && specifiedHost !== 'auto') {
      return specifiedHost;
    }
    
    // Auto-detect best host
    if (this.isEmulator()) {
      if (Platform.OS === 'ios') {
        return this.iosSimulatorHost;
      } else if (Platform.OS === 'android') {
        return this.androidEmulatorHost;
      }
    }
    
    // For real devices, default to specified IP
    return this.defaultIp;
  }
}

// API Configuration
// ===================================================
const API_CONFIG = {
  // Protocol (http or https)
  protocol: 'http',
  
  // Set the specific backend server IP
  host: '172.20.10.3',
  
  // Backend server port
  port: 5001,
  
  // API base path
  basePath: '/api',
  
  // Include mock data alongside real API data - DISABLED
  useMixedData: false,
  
  // Enable mock data when API is unreachable - ENABLED
  useMockDataOnFailure: true,
  
  // Force mock data when testing UI - DISABLED
  forceMockData: false
};

// Resolve the host based on environment
const resolvedHost = NetworkInfo.getAppropriateHost(API_CONFIG.host);

// Base URL construction
const getBaseUrl = () => {
  // Build the URL with the resolved host
  return `${API_CONFIG.protocol}://${resolvedHost}:${API_CONFIG.port}${API_CONFIG.basePath}`;
};

const API_URL = getBaseUrl();
console.log(`🌐 API URL: ${API_URL} (Host: ${resolvedHost}, Device: ${Platform.OS}, Emulator: ${NetworkInfo.isEmulator()})`);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to avoid hanging requests
  timeout: 10000 // 10 seconds
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  config => {
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Remove the request cancellation since we're not using mock data anymore
    return config;
  },
  error => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  error => {
    console.error(`❌ API Response Error: ${error.message}`);
    if (error.response) {
      // The request was made and the server responded with an error status code
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Request details:', error.request);
    }
    return Promise.reject(error);
  }
);

// Helper function to format dates for backend
const formatDateForBackend = (dateString) => {
  if (!dateString) return new Date().toISOString();
  
  // Check if it's in DD.MM.YYYY format
  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  if (dateRegex.test(dateString)) {
    const matches = dateString.match(dateRegex);
    const day = parseInt(matches[1], 10);
    const month = parseInt(matches[2], 10) - 1; // JS months are 0-indexed
    const year = parseInt(matches[3], 10);
    
    // Create a proper Date object and convert to ISO string
    const date = new Date(year, month, day);
    return date.toISOString();
  }
  
  // Try to create a valid date from the string
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.error('Error parsing date:', e);
  }
  
  // If we couldn't parse the date, use current date as fallback
  return new Date().toISOString();
};

// Scammers API
export const scammersApi = {
  // Get all scammers - pure backend version
  getAllScammers: async () => {
    try {
      const response = await apiClient.get('/scammers');
      return response.data;
    } catch (error) {
      console.error('Error fetching scammers:', error);
      throw new Error(`Failed to fetch scammers: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Search scammers - pure backend version
  searchScammers: async (query) => {
    try {
      const response = await apiClient.get(`/scammers/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching scammers:', error);
      throw new Error(`Failed to search scammers: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Report new scammer - pure backend version
  reportScammer: async (scammerData) => {
    try {
      // Create a copy of the data to avoid modifying the original
      const formattedData = { ...scammerData };
      
      // We don't need to format dateAdded anymore as backend handles it correctly
      // Remove dateAdded if it exists to let the backend set it
      delete formattedData.dateAdded;
      
      console.log('Sending scammer data to backend:', formattedData);
      
      const response = await apiClient.post('/scammers', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error reporting scammer:', error);
      
      // Add more specific error handling for validation errors
      if (error.response && error.response.data) {
        console.error('Server responded with error:', error.response.status, error.response.data);
        throw new Error(`${error.response.data.error || error.response.data.message || 'Validation failed'}`);
      }
      
      throw new Error(`Failed to report scammer: ${error.message || 'Unknown error'}`);
    }
  }
};

// Schemes API
export const schemesApi = {
  // Get all schemes - pure backend version
  getAllSchemes: async () => {
    try {
      const response = await apiClient.get('/schemes');
      return response.data;
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw new Error(`Failed to fetch schemes: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Search schemes - pure backend version
  searchSchemes: async (query) => {
    try {
      const response = await apiClient.get(`/schemes/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching schemes:', error);
      throw new Error(`Failed to search schemes: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Report new scheme - pure backend version
  reportScheme: async (schemeData) => {
    try {
      // Create a copy with properly formatted dates
      const formattedData = {
        reporterInfo: schemeData.reporterInfo,
        schemeDetails: { ...schemeData.schemeDetails }
      };
      
      // We don't need to format dateOccurred anymore as backend handles it correctly
      // If there's a dateOccurred in string format, let the backend handle it properly
      if (typeof formattedData.schemeDetails.dateOccurred === 'string') {
        // Try to create a valid date
        try {
          const date = new Date(formattedData.schemeDetails.dateOccurred);
          if (!isNaN(date.getTime())) {
            formattedData.schemeDetails.dateOccurred = date;
          } else {
            // If invalid, remove it
            delete formattedData.schemeDetails.dateOccurred;
          }
        } catch (e) {
          // If error parsing, remove it
          delete formattedData.schemeDetails.dateOccurred;
        }
      }
      
      // Keep the financial loss if present
      if (schemeData.schemeDetails.financialLoss) {
        formattedData.schemeDetails.financialLoss = Number(schemeData.schemeDetails.financialLoss);
      }
      
      console.log('Sending scheme data to backend:', formattedData);
      
      const response = await apiClient.post('/scheme-reports', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error reporting scheme:', error);
      
      // Add more specific error handling for validation errors
      if (error.response && error.response.data) {
        console.error('Server responded with error:', error.response.status, error.response.data);
        throw new Error(`${error.response.data.error || error.response.data.message || 'Validation failed'}`);
      }
      
      throw new Error(`Failed to report scheme: ${error.message || 'Unknown error'}`);
    }
  }
};

// Appeals API
export const appealsApi = {
  // Submit new appeal - pure backend version
  submitAppeal: async (appealData) => {
    try {
      const response = await apiClient.post('/appeals', appealData);
      return response.data;
    } catch (error) {
      console.error('Error submitting appeal:', error);
      
      // Add more specific error handling for validation errors
      if (error.response && error.response.data.error) {
        console.error('Server responded with error:', error.response.status, error.response.data);
        throw new Error(`Error submitting appeal: ${error.response.data.error || error.response.data.message || 'Validation failed'}`);
      }
      
      throw new Error(`Failed to submit appeal: ${error.message || 'Unknown error'}`);
    }
  }
};

// Missing reports API
export const missingReportsApi = {
  // Get active missing reports - pure backend version
  getActiveMissingReports: async () => {
    try {
      const response = await apiClient.get('/missing-reports/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching missing reports:', error);
      throw new Error(`Failed to fetch missing reports: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Submit missing report - pure backend version
  submitMissingReport: async (reportData) => {
    try {
      // Create a copy of the data without modifying dates
      const formattedData = { ...reportData };
      
      // Remove dateAdded to let the backend handle it
      delete formattedData.dateAdded;
      
      // For lastSeenDate, if it's a string, try to create a proper Date object
      if (typeof formattedData.lastSeenDate === 'string') {
        try {
          const date = new Date(formattedData.lastSeenDate);
          if (!isNaN(date.getTime())) {
            formattedData.lastSeenDate = date;
          } else {
            delete formattedData.lastSeenDate;
          }
        } catch (e) {
          delete formattedData.lastSeenDate;
        }
      }
      
      // If using missingInfo structure, also handle that
      if (formattedData.missingInfo && typeof formattedData.missingInfo.lastSeenDate === 'string') {
        try {
          const date = new Date(formattedData.missingInfo.lastSeenDate);
          if (!isNaN(date.getTime())) {
            formattedData.missingInfo.lastSeenDate = date;
          } else {
            delete formattedData.missingInfo.lastSeenDate;
          }
        } catch (e) {
          delete formattedData.missingInfo.lastSeenDate;
        }
      }
      
      console.log('Sending missing person report to backend:', formattedData);
      
      const response = await apiClient.post('/missing-reports', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error submitting missing report:', error);
      
      // Add more specific error handling for validation errors
      if (error.response && error.response.data) {
        console.error('Server responded with error:', error.response.status, error.response.data);
        throw new Error(`${error.response.data.error || error.response.data.message || 'Validation failed'}`);
      }
      
      throw new Error(`Failed to submit missing report: ${error.message || 'Unknown error'}`);
    }
  }
};

// Export API configuration for other files to use
export const apiConfig = {
  ...API_CONFIG,
  url: API_URL
};

// Default export for all APIs
const api = {
  scammersApi,
  schemesApi,
  appealsApi,
  missingReportsApi,
  apiClient,
  API_URL
};

export default api;

// Helper function to get mock scammers data
function getMockScammers() {
  return [
    {
      id: '1',
      _id: '1',
      name: 'ТОО "КазИнвест"',
      type: 'financial',
      description: 'Предлагают быстрый доход от инвестиций в "эксклюзивный" проект. Обещают доходность 30% в месяц.',
      contactInfo: '+7 (777) 123-4567, invest@kazinvest-fake.kz',
      additionalInfo: 'Используют поддельные документы с государственными печатями.',
      dateAdded: new Date('2023-05-10')
    },
    {
      id: '2',
      _id: '2',
      name: 'Аскар Мамедов',
      type: 'online',
      description: 'Выдает себя за сотрудника банка и просит данные карт для "проверки безопасности".',
      contactInfo: '+7 (702) 987-6543, различные аккаунты в социальных сетях',
      dateAdded: new Date('2023-04-15')
    },
    {
      id: '3',
      _id: '3',
      name: '+7 (708) 555-1234',
      type: 'phone',
      description: 'Звонят с сообщением о блокировке банковской карты и просят провести операцию через банкомат.',
      contactInfo: '+7 (708) 555-1234',
      dateAdded: new Date('2023-05-02')
    },
    {
      id: '4',
      _id: '4',
      name: 'support@nationalbank-kz.com',
      type: 'online',
      description: 'Фишинговые письма от имени Национального Банка с требованием обновить данные.',
      contactInfo: 'support@nationalbank-kz.com',
      additionalInfo: 'Настоящий домен нацбанка - nationalbank.kz',
      dateAdded: new Date('2023-04-20')
    },
    {
      id: '5',
      _id: '5',
      name: 'ИП "Курьерская доставка"',
      type: 'other',
      description: 'Берут предоплату за доставку несуществующих товаров.',
      contactInfo: '+7 (747) 456-7890, delivery@express-fake.kz',
      dateAdded: new Date('2023-05-05')
    }
  ];
}

// Helper function to get mock schemes data
function getMockSchemes() {
  return [
    {
      id: '1',
      _id: '1',
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
      _id: '2',
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
      _id: '3',
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
      _id: '4',
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
      _id: '5',
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
    },
    {
      id: '6',
      _id: '6',
      title: 'Поддельные лотереи и конкурсы',
      description: 'Мошенники сообщают о выигрыше в лотерею, в которой вы не участвовали, и требуют оплатить налог или комиссию за получение приза.',
      warningSign: [
        'Сообщение о выигрыше в конкурсе, в котором вы не участвовали',
        'Требование оплатить комиссию за перевод денег',
        'Необходимость предоставить личные данные для получения приза',
        'Ограниченное время на получение выигрыша'
      ],
      howToAvoid: [
        'Помните, что настоящие лотереи не требуют предоплаты для получения выигрыша',
        'Проверяйте информацию на официальных сайтах компаний',
        'Не переводите деньги незнакомым людям',
        'Обращайтесь в полицию при подозрении на мошенничество'
      ]
    },
    {
      id: '7',
      _id: '7',
      title: 'Мошенничество с трудоустройством',
      description: 'Предложения высокооплачиваемой работы с минимальными требованиями, но с необходимостью внести предоплату за обучение, материалы или регистрационный взнос.',
      warningSign: [
        'Обещание высокого заработка при минимуме усилий',
        'Требование оплаты за материалы или обучение до начала работы',
        'Отсутствие собеседования или формального процесса найма',
        'Неясное описание обязанностей'
      ],
      howToAvoid: [
        'Проверяйте информацию о компании',
        'Никогда не платите за трудоустройство',
        'Запрашивайте детальную информацию о должности и обязанностях',
        'Ищите работу через проверенные сервисы'
      ]
    },
    {
      id: '8',
      _id: '8',
      title: 'Мошенничество с помощью в решении проблем с компьютером',
      description: 'Мошенники звонят и представляются техническими специалистами Microsoft или другой компании, сообщают о проблемах с компьютером и просят предоставить удаленный доступ для их исправления.',
      warningSign: [
        'Звонок от "технического специалиста" без вашего обращения',
        'Заявление о вирусах на компьютере, о которых вы не знали',
        'Просьба установить программу удаленного доступа',
        'Требование оплаты за устранение несуществующих проблем'
      ],
      howToAvoid: [
        'Никогда не предоставляйте удаленный доступ к компьютеру незнакомым людям',
        'Проверяйте официальный номер поддержки Microsoft или другой компании',
        'Не перезванивайте на номера из всплывающих уведомлений',
        'Используйте антивирусные программы'
      ]
    }
  ];
}

// Helper function to get mock missing reports
function getMockMissingReports() {
  return [
    {
      id: '1',
      _id: '1',
      fullName: 'Исатаев Арман Булатович',
      age: 32,
      gender: 'Мужской',
      lastSeenDate: new Date('2023-12-15'),
      lastSeenLocation: 'г. Алматы, ул. Абая 10',
      description: 'Рост 175 см, худощавого телосложения, карие глаза, темные волосы. Был одет в черную куртку, синие джинсы и красную кепку.',
      contactInfo: '+7 (701) 234-5678',
      image: 'https://via.placeholder.com/150?text=Missing+Person',
      status: 'active',
      dateAdded: new Date('2023-12-16')
    },
    {
      id: '2',
      _id: '2',
      fullName: 'Нурланова Айгуль Ержановна',
      age: 27,
      gender: 'Женский',
      lastSeenDate: new Date('2023-12-20'),
      lastSeenLocation: 'г. Нур-Султан, ТРЦ "Хан Шатыр"',
      description: 'Рост 165 см, среднего телосложения, зеленые глаза, светлые волосы до плеч. Была одета в белое пальто и черные брюки.',
      contactInfo: '+7 (705) 987-6543',
      image: 'https://via.placeholder.com/150?text=Missing+Person',
      status: 'active',
      dateAdded: new Date('2023-12-21')
    },
    {
      id: '3',
      _id: '3',
      fullName: 'Касымов Ерлан Тимурович',
      age: 45,
      gender: 'Мужской',
      lastSeenDate: new Date('2023-12-18'),
      lastSeenLocation: 'г. Караганда, район Михайловка',
      description: 'Рост 180 см, крепкого телосложения, серые глаза, седые волосы. Был одет в коричневую кожаную куртку и темные брюки.',
      contactInfo: '+7 (702) 345-6789',
      image: 'https://via.placeholder.com/150?text=Missing+Person',
      status: 'active',
      dateAdded: new Date('2023-12-19')
    }
  ];
} 