import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Конфигурация листов
const SHEETS = [
  {
    title: 'Categories',
    headerValues: ['id', 'name', 'imageUrl', 'description']
  },
  {
    title: 'Products',
    headerValues: [
      'id',
      'categoryId',
      'name',
      'description',
      'ingredients',
      'images',
      'isAvailable',
      'price',
      'additionalInfo'
    ]
  },
  {
    title: 'Customers',
    headerValues: [
      'id',
      'telegramId',
      'name',
      'username',
      'phone',
      'registrationDate',
      'lastActivity'
    ]
  },
  {
    title: 'Orders',
    headerValues: [
      'id',
      'customerId',
      'customerName',
      'customerContact',
      'productId',
      'productName',
      'deliveryDate',
      'packaging',
      'deliveryMethod',
      'additionalComment',
      'createdAt',
      'status'
    ]
  }
];

// Тестовые данные
const SAMPLE_CATEGORIES = [
  {
    id: '1',
    name: 'Торты',
    imageUrl: 'https://example.com/cakes.jpg',
    description: 'Праздничные торты на заказ'
  },
  {
    id: '2',
    name: 'Пирожные',
    imageUrl: 'https://example.com/pastries.jpg',
    description: 'Вкусные маленькие пирожные'
  }
];

const SAMPLE_PRODUCTS = [
  {
    id: '1',
    categoryId: '1',
    name: 'Торт "Наполеон"',
    description: 'Классический торт с заварным кремом',
    ingredients: 'Мука, масло, молоко, яйца, сахар',
    images: 'https://example.com/napoleon1.jpg,https://example.com/napoleon2.jpg',
    isAvailable: 'TRUE',
    price: '1500',
    additionalInfo: 'Срок изготовления: 1-2 дня'
  },
  {
    id: '2',
    categoryId: '1',
    name: 'Торт "Медовик"',
    description: 'Нежный медовый торт со сметанным кремом',
    ingredients: 'Мед, мука, сметана, сахар, масло',
    images: 'https://example.com/medovik.jpg',
    isAvailable: 'TRUE',
    price: '1800',
    additionalInfo: 'Срок изготовления: 1-2 дня'
  },
  {
    id: '3',
    categoryId: '2',
    name: 'Эклеры',
    description: 'Французские пирожные с заварным кремом',
    ingredients: 'Мука, масло, вода, яйца, сахар',
    images: 'https://example.com/eclair.jpg',
    isAvailable: 'TRUE',
    price: '200',
    additionalInfo: 'Минимальный заказ: 5 шт.'
  }
];

async function setupSpreadsheet() {
  console.log('Начинаем настройку Google таблицы...');

  try {
    // Создаем экземпляр документа
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

    // Авторизуемся
    await doc.useServiceAccountAuth({
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    });

    await doc.loadInfo();
    console.log(`Успешно подключились к таблице: ${doc.title}`);

    // Создаем листы (если они еще не существуют)
    for (const sheetConfig of SHEETS) {
      let sheet = doc.sheetsByTitle[sheetConfig.title];

      if (!sheet) {
        console.log(`Создаем новый лист: ${sheetConfig.title}`);
        sheet = await doc.addSheet({ title: sheetConfig.title });
      } else {
        console.log(`Лист ${sheetConfig.title} уже существует`);
      }

      // Устанавливаем заголовки
      await sheet.setHeaderRow(sheetConfig.headerValues);
      console.log(`Установлены заголовки для листа ${sheetConfig.title}`);
    }

    // Добавляем тестовые данные в категории
    const categoriesSheet = doc.sheetsByTitle['Categories'];
    const existingCategories = await categoriesSheet.getRows();

    if (existingCategories.length === 0) {
      console.log('Добавляем тестовые категории...');
      await categoriesSheet.addRows(SAMPLE_CATEGORIES);
    } else {
      console.log('Категории уже существуют, пропускаем добавление тестовых данных');
    }

    // Добавляем тестовые данные в продукты
    const productsSheet = doc.sheetsByTitle['Products'];
    const existingProducts = await productsSheet.getRows();

    if (existingProducts.length === 0) {
      console.log('Добавляем тестовые продукты...');
      await productsSheet.addRows(SAMPLE_PRODUCTS);
    } else {
      console.log('Продукты уже существуют, пропускаем добавление тестовых данных');
    }

    console.log('Настройка Google таблицы успешно завершена!');
  } catch (error) {
    console.error('Ошибка при настройке Google таблицы:', error);
  }
}

// Запуск скрипта
setupSpreadsheet();