import dotenv from 'dotenv';
import googleSheetsService from '../services/googleSheetsService.js';
import telegramService from '../services/telegramService.js';

// Загрузка переменных окружения
dotenv.config();

// Функция для тестирования Google Sheets
async function testGoogleSheets() {
  console.log('🔍 Тестирование подключения к Google Sheets...');
  
  try {
    // Инициализация сервиса
    await googleSheetsService.init();
    console.log('✅ Успешное подключение к Google Sheets!');
    
    // Тестирование получения категорий
    console.log('\n📋 Получение списка категорий...');
    const categories = await googleSheetsService.getCategories();
    console.log(`✅ Получено категорий: ${categories.length}`);
    console.log(categories);
    
    // Тестирование получения продуктов
    console.log('\n📋 Получение списка продуктов...');
    const products = await googleSheetsService.getProducts();
    console.log(`✅ Получено продуктов: ${products.length}`);
    console.log(products);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при тестировании Google Sheets:', error);
    return false;
  }
}

// Функция для тестирования Telegram бота
async function testTelegramBot() {
  console.log('\n🔍 Тестирование подключения к Telegram...');
  
  try {
    // Инициализация бота в тестовом режиме
    await telegramService.init(true); // Передаем true для тестового режима
    console.log('✅ Telegram бот успешно инициализирован!');
    
    // Проверка, что ID админа установлен
    const adminId = telegramService.adminId;
    if (!adminId) {
      console.warn('⚠️ ВНИМАНИЕ: ID администратора не установлен в .env файле');
    } else {
      console.log(`✅ ID администратора установлен: ${adminId}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при тестировании Telegram бота:', error);
    return false;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('==========================');
  console.log('🧪 ЗАПУСК ТЕСТИРОВАНИЯ БЭКЕНДА');
  console.log('==========================\n');
  
  // Проверка переменных окружения
  console.log('🔍 Проверка переменных окружения...');
  
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_SPREADSHEET_ID'
  ];
  
  let envVarsOk = true;
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Отсутствует переменная окружения: ${envVar}`);
      envVarsOk = false;
    } else {
      console.log(`✅ ${envVar}: Установлена`);
    }
  }
  
  if (!envVarsOk) {
    console.error('\n❌ Тестирование не может быть продолжено из-за отсутствия необходимых переменных окружения.');
    process.exit(1);
  }
  
  console.log('\n✅ Все необходимые переменные окружения установлены!');
  
  // Запуск тестов для Google Sheets
  const sheetsTestResult = await testGoogleSheets();
  
  // Запуск тестов для Telegram бота
  const telegramTestResult = await testTelegramBot();
  
  // Итоговые результаты
  console.log('\n==========================');
  console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
  console.log('==========================');
  console.log(`Google Sheets: ${sheetsTestResult ? '✅ Успешно' : '❌ Ошибка'}`);
  console.log(`Telegram Bot: ${telegramTestResult ? '✅ Успешно' : '❌ Ошибка'}`);
  console.log('==========================');
  
  if (sheetsTestResult && telegramTestResult) {
    console.log('\n✅ Все тесты прошли успешно! Бэкенд готов к работе.');
  } else {
    console.log('\n❌ Обнаружены ошибки. Проверьте логи выше.');
  }
  
  // Завершаем процесс
  process.exit(0);
}

// Запуск тестирования
runTests();