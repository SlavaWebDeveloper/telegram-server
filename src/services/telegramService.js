import { Telegraf } from 'telegraf';
import config from '../config/config.js';

class TelegramService {
  constructor() {
    this.bot = new Telegraf(config.telegramBot.token);
    this.adminId = config.telegramBot.adminId;
    this.initialized = false;
  }

  async init(testMode = false) {
    if (this.initialized) return;

    try {
      // Обработка команды start
      this.bot.start((ctx) => {
        if (ctx.from.id.toString() === this.adminId) {
          return ctx.reply('Приветствую, администратор! Я буду отправлять вам уведомления о новых заказах.');
        }

        return ctx.reply('Привет! Чтобы просмотреть каталог продукции, откройте мини-приложение.');
      });

      // Обработка команды админа для рассылки
      this.bot.command('broadcast', async (ctx) => {
        if (ctx.from.id.toString() !== this.adminId) {
          return ctx.reply('Эта команда доступна только администратору.');
        }

        const messageText = ctx.message.text.split('/broadcast ')[1];
        if (!messageText) {
          return ctx.reply('Пожалуйста, укажите текст сообщения после команды /broadcast');
        }

        ctx.reply('Рассылка будет отправлена из мини-приложения. Откройте его для продолжения.');
      });

      // Запуск бота, но в тестовом режиме не запускаем долгосрочное соединение
      if (!testMode) {
        await this.bot.launch();
        console.log('Telegram бот успешно запущен');
      } else {
        // В тестовом режиме просто проверяем подключение
        console.log('Telegram бот успешно инициализирован (тестовый режим)');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Ошибка инициализации Telegram бота:', error);
      throw error;
    }
  }

  // Метод для остановки бота
  async stop() {
    if (this.initialized) {
      this.bot.stop('SIGINT');
      this.initialized = false;
      console.log('Telegram бот остановлен');
    }
  }

  // Отправка сообщения конкретному пользователю
  async sendMessage(userId, message) {
    try {
      // Инициализация бота, если еще не инициализирован
      if (!this.initialized) {
        await this.init(false);
      }

      await this.bot.telegram.sendMessage(userId, message);
      return true;
    } catch (error) {
      console.error(`Ошибка отправки сообщения пользователю ${userId}:`, error);
      return false;
    }
  }

  // Отправка уведомления о заказе администратору
  async sendOrderNotification(orderData) {
    try {
      // Инициализация бота, если еще не инициализирован
      if (!this.initialized) {
        await this.init(false);
      }

      const message = `
🍰 *НОВЫЙ ЗАКАЗ* 🍰

👤 *Клиент*: ${orderData.customerName}
📱 *Контакт*: ${orderData.customerContact}

🎂 *Продукт*: ${orderData.productName}
📅 *Дата получения*: ${orderData.deliveryDate}
📦 *Упаковка*: ${orderData.packaging}
🚚 *Способ получения*: ${orderData.deliveryMethod}

💬 *Комментарий*: ${orderData.additionalComment || 'Нет'}

📝 *Идентификатор заказа*: \`${orderData.id}\`
    `;

      try {
        await this.bot.telegram.sendMessage(this.adminId, message, { parse_mode: 'Markdown' });
        return true;
      } catch (error) {
        console.error('Ошибка отправки уведомления о заказе администратору:', error);
        return false;
      }
    } catch (error) {
      console.error('Ошибка массовой рассылки сообщений:', error);
      throw error;
    }
  }

  // Массовая рассылка сообщений клиентам
  async broadcastMessage(userIds, message) {
    try {
      // Инициализация бота, если еще не инициализирован
      if (!this.initialized) {
        await this.init(false);
      }

      const results = [];

      for (const userId of userIds) {
        try {
          await this.bot.telegram.sendMessage(userId, message);
          results.push({ userId, success: true });
        } catch (error) {
          console.error(`Ошибка отправки сообщения пользователю ${userId}:`, error);
          results.push({ userId, success: false, error: error.message });
        }

        // Небольшая задержка для предотвращения ограничений Telegram API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return results;
    } catch (error) {
      console.error('Ошибка массовой рассылки сообщений:', error);
      throw error;
    }
  }
}

export default new TelegramService();