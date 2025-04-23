import { GoogleSpreadsheet } from 'google-spreadsheet';
import config from '../config/config.js';

class GoogleSheetsService {
  constructor() {
    this.doc = new GoogleSpreadsheet(config.googleSheets.spreadsheetId);
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Исправленный метод авторизации для версии 4.x
      await this.doc.useServiceAccountAuth({
        client_email: config.googleSheets.serviceAccountEmail,
        private_key: config.googleSheets.privateKey,
      });
      
      await this.doc.loadInfo();
      console.log(`Успешно загружена Google таблица: ${this.doc.title}`);
      this.initialized = true;
    } catch (error) {
      console.error('Ошибка инициализации Google Sheets:', error);
      throw error;
    }
  }

  // Получение листа по названию
  async getSheet(sheetName) {
    await this.init();
    
    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Лист "${sheetName}" не найден`);
    }
    
    return sheet;
  }

  // Получение всех категорий
  async getCategories() {
    const sheet = await this.getSheet(config.googleSheets.sheets.categories);
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      imageUrl: row.imageUrl || '',
      description: row.description || ''
    }));
  }

  // Получение всех продуктов или по категории
  async getProducts(categoryId = null) {
    const sheet = await this.getSheet(config.googleSheets.sheets.products);
    const rows = await sheet.getRows();
    
    let products = rows.map(row => ({
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description || '',
      ingredients: row.ingredients || '',
      images: row.images ? row.images.split(',').map(img => img.trim()) : [],
      isAvailable: row.isAvailable === 'TRUE',
      price: row.price || '',
      additionalInfo: row.additionalInfo || ''
    }));
    
    // Фильтрация по категории, если указан categoryId
    if (categoryId) {
      products = products.filter(product => product.categoryId === categoryId);
    }
    
    return products;
  }

  // Поиск продуктов по тексту (название или ингредиенты)
  async searchProducts(searchText) {
    const sheet = await this.getSheet(config.googleSheets.sheets.products);
    const rows = await sheet.getRows();
    const searchLower = searchText.toLowerCase();
    
    return rows
      .filter(row => 
        row.name.toLowerCase().includes(searchLower) || 
        (row.ingredients && row.ingredients.toLowerCase().includes(searchLower))
      )
      .map(row => ({
        id: row.id,
        categoryId: row.categoryId,
        name: row.name,
        description: row.description || '',
        ingredients: row.ingredients || '',
        images: row.images ? row.images.split(',').map(img => img.trim()) : [],
        isAvailable: row.isAvailable === 'TRUE',
        price: row.price || '',
        additionalInfo: row.additionalInfo || ''
      }));
  }

  // Сохранение информации о клиенте
  async saveCustomer(customerData) {
    const sheet = await this.getSheet(config.googleSheets.sheets.customers);
    
    // Проверяем, существует ли пользователь уже
    const rows = await sheet.getRows();
    const existingCustomer = rows.find(row => row.telegramId === customerData.telegramId);
    
    if (existingCustomer) {
      // Обновляем существующего клиента
      existingCustomer.name = customerData.name;
      existingCustomer.username = customerData.username || '';
      existingCustomer.phone = customerData.phone || '';
      existingCustomer.lastActivity = new Date().toISOString();
      await existingCustomer.save();
      
      return {
        ...customerData,
        id: existingCustomer.id
      };
    } else {
      // Создаем нового клиента
      const newCustomer = {
        id: Date.now().toString(), // Простой способ генерации уникального ID
        telegramId: customerData.telegramId,
        name: customerData.name,
        username: customerData.username || '',
        phone: customerData.phone || '',
        registrationDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      await sheet.addRow(newCustomer);
      
      return newCustomer;
    }
  }

  // Сохранение заказа
  async saveOrder(orderData) {
    const sheet = await this.getSheet(config.googleSheets.sheets.orders);
    
    const newOrder = {
      id: Date.now().toString(),
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerContact: orderData.customerContact,
      productId: orderData.productId,
      productName: orderData.productName,
      deliveryDate: orderData.deliveryDate,
      packaging: orderData.packaging,
      deliveryMethod: orderData.deliveryMethod,
      additionalComment: orderData.additionalComment || '',
      createdAt: new Date().toISOString(),
      status: 'new' // Начальный статус заказа
    };
    
    await sheet.addRow(newOrder);
    
    return newOrder;
  }

  // Получение всех клиентов для рассылки
  async getAllCustomers() {
    const sheet = await this.getSheet(config.googleSheets.sheets.customers);
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      id: row.id,
      telegramId: row.telegramId,
      name: row.name,
      username: row.username || '',
      phone: row.phone || ''
    }));
  }
}

export default new GoogleSheetsService();