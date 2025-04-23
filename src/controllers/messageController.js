import googleSheetsService from '../services/googleSheetsService.js';
import telegramService from '../services/telegramService.js';
import config from '../config/config.js';

// Отправка сообщения администратору от пользователя
export const sendMessageToAdmin = async (req, res) => {
  try {
    const { customerName, telegramUsername, message } = req.body;

    if (!customerName || !message) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля (customerName, message)'
      });
    }

    const adminMessage = `
📨 *Сообщение от клиента*

👤 *От*: ${customerName}${telegramUsername ? ` (@${telegramUsername})` : ''}
💬 *Сообщение*: ${message}

_Отправлено через мини-приложение_
    `;

    const messageSent = await telegramService.sendMessage(
      config.telegramBot.adminId,
      adminMessage
    );

    if (!messageSent) {
      throw new Error('Не удалось отправить сообщение администратору');
    }

    res.json({
      success: true,
      message: 'Сообщение успешно отправлено администратору'
    });

  } catch (error) {
    console.error('Ошибка при отправке сообщения администратору:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при отправке сообщения администратору'
    });
  }
};

// Отправка массовой рассылки клиентам (только для админа)
export const broadcastMessage = async (req, res) => {
  try {
    const { message, senderTelegramId } = req.body;

    // Проверка, что запрос от администратора
    if (senderTelegramId !== config.telegramBot.adminId) {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Только администратор может отправлять массовые рассылки.'
      });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Сообщение не может быть пустым'
      });
    }

    // Получение всех клиентов
    const customers = await googleSheetsService.getAllCustomers();
    const customerIds = customers.map(customer => customer.telegramId);

    // Отправка сообщения всем клиентам
    const broadcastResults = await telegramService.broadcastMessage(customerIds, message);

    // Подсчет успешных и неудачных отправок
    const successCount = broadcastResults.filter(result => result.success).length;
    const failCount = broadcastResults.length - successCount;

    res.json({
      success: true,
      data: {
        totalCustomers: customerIds.length,
        successfulDeliveries: successCount,
        failedDeliveries: failCount,
        details: broadcastResults
      },
      message: `Рассылка отправлена: ${successCount} успешно, ${failCount} не доставлено`
    });

  } catch (error) {
    console.error('Ошибка при отправке рассылки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при отправке рассылки'
    });
  }
};