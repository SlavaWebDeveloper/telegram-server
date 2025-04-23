import googleSheetsService from '../services/googleSheetsService.js';
import telegramService from '../services/telegramService.js';

// Создание нового заказа
export const createOrder = async (req, res) => {
  try {
    const {
      productId,
      productName,
      customerId,
      customerName,
      customerContact,
      deliveryDate,
      packaging,
      deliveryMethod,
      additionalComment
    } = req.body;

    // Проверка наличия обязательных полей
    if (!productId || !productName || !customerName || !customerContact || !deliveryDate || !packaging || !deliveryMethod) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля'
      });
    }

    // Сохранение заказа в Google Sheets
    const orderData = {
      productId,
      productName,
      customerId,
      customerName,
      customerContact,
      deliveryDate,
      packaging,
      deliveryMethod,
      additionalComment
    };

    const savedOrder = await googleSheetsService.saveOrder(orderData);

    // Отправка уведомления администратору
    await telegramService.sendOrderNotification(savedOrder);

    // Отправка подтверждения клиенту, если есть его telegramId
    if (orderData.customerId) {
      const confirmationMessage = `
🎂 Ваш заказ успешно принят!

Детали заказа:
- Продукт: ${orderData.productName}
- Дата получения: ${orderData.deliveryDate}
- Способ получения: ${orderData.deliveryMethod}

Мы свяжемся с вами для подтверждения заказа. Спасибо за доверие!
      `;

      try {
        await telegramService.sendMessage(orderData.customerId, confirmationMessage);
      } catch (error) {
        console.error('Ошибка отправки подтверждения клиенту:', error);
        // Продолжаем работу, даже если сообщение не отправлено
      }
    }

    res.json({
      success: true,
      data: savedOrder,
      message: 'Заказ успешно создан и отправлен администратору'
    });

  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при создании заказа'
    });
  }
};

// Сохранение данных пользователя
export const saveCustomer = async (req, res) => {
  try {
    const { telegramId, name, username, phone } = req.body;

    if (!telegramId || !name) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля (telegramId, name)'
      });
    }

    const customerData = {
      telegramId,
      name,
      username,
      phone
    };

    const savedCustomer = await googleSheetsService.saveCustomer(customerData);

    res.json({
      success: true,
      data: savedCustomer,
      message: 'Данные пользователя успешно сохранены'
    });

  } catch (error) {
    console.error('Ошибка при сохранении данных пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при сохранении данных пользователя'
    });
  }
};