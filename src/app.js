import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import * as productController from './controllers/productController.js';
import * as orderController from './controllers/orderController.js';
import * as messageController from './controllers/messageController.js';
import telegramService from './services/telegramService.js';
import googleSheetsService from './services/googleSheetsService.js';
import { validateTelegramInitData } from './utils/helpers.js';

// Инициализация приложения Express
const app = express();

// Настройка middleware
app.use(cors());
app.use(express.json());

// Middleware для проверки Telegram данных
const verifyTelegramWebAppData = (req, res, next) => {
  // Пропускаем проверку для запросов, не требующих авторизации
  if (req.path === '/health' || req.method === 'GET') {
    return next();
  }
  
  const initData = req.headers['telegram-init-data'];
  
  // Временно отключаем проверку для удобства разработки
  // if (!initData || !validateTelegramInitData(initData)) {
  //   return res.status(401).json({ success: false, error: 'Неверные данные Telegram' });
  // }
  
  next();
};

// Применяем middleware для проверки Telegram данных
app.use(verifyTelegramWebAppData);

// Маршруты для категорий и продуктов
app.get('/api/categories', productController.getCategories);
app.get('/api/products', productController.getProducts);
app.get('/api/products/search', productController.searchProducts);
app.get('/api/products/:id', productController.getProductById);

// Маршруты для заказов
app.post('/api/orders', orderController.createOrder);
app.post('/api/customers', orderController.saveCustomer);

// Маршруты для сообщений
app.post('/api/messages/admin', messageController.sendMessageToAdmin);
app.post('/api/messages/broadcast', messageController.broadcastMessage);

// Проверка работоспособности сервера
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Внутренняя ошибка сервера' 
  });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Маршрут не найден' 
  });
});

// Инициализация внешних сервисов и запуск сервера
const startServer = async () => {
  try {
    // Запуск сервера сразу, чтобы API было доступно
    const PORT = config.server.port;
    const server = app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });

    // Обработка сигналов остановки для корректного завершения работы
    process.on('SIGINT', async () => {
      console.log('\nПолучен сигнал SIGINT. Выполняем плавное завершение...');
      
      // Останавливаем телеграм бота, если он запущен
      if (telegramService.initialized) {
        await telegramService.stop();
      }
      
      // Закрываем HTTP сервер
      server.close(() => {
        console.log('Сервер HTTP остановлен');
        process.exit(0);
      });
    });

    // Инициализация Google Sheets в фоновом режиме
    try {
      await googleSheetsService.init();
      console.log('Google Sheets сервис успешно инициализирован');
    } catch (error) {
      console.error('Ошибка при инициализации Google Sheets:', error);
      console.log('Сервер продолжит работу без Google Sheets');
    }
    
    // Инициализация Telegram бота в фоновом режиме
    try {
      await telegramService.init(false);
      console.log('Telegram бот успешно инициализирован');
    } catch (error) {
      console.error('Ошибка при инициализации Telegram бота:', error);
      console.log('Сервер продолжит работу без Telegram бота');
    }
  } catch (error) {
    console.error('Критическая ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

startServer();