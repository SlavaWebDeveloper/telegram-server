import dotenv from 'dotenv';

// Загружаем переменные окружения из .env файла
dotenv.config();

const config = {
  telegramBot: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    adminId: process.env.ADMIN_TELEGRAM_ID
  },
  googleSheets: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Заменяем escaped \n на реальные переводы строк
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    sheets: {
      products: 'Products', // Лист с продуктами
      categories: 'Categories', // Лист с категориями
      orders: 'Orders', // Лист с заказами
      customers: 'Customers' // Лист с клиентами
    }
  },
  server: {
    port: process.env.PORT || 3000
  }
};

export default config;