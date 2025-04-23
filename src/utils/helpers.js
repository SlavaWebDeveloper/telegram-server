import crypto from 'crypto';
import config from '../config/config.js';

// Проверка валидности Telegram данных
export const validateTelegramInitData = (initData) => {
  if (!initData) return false;

  try {
    // Парсим строку init_data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) return false;

    // Удаляем hash из данных для проверки
    urlParams.delete('hash');

    // Сортируем оставшиеся параметры
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckArray = keys.map(key => `${key}=${urlParams.get(key)}`);
    const dataCheckString = dataCheckArray.join('\n');

    // Создаем HMAC-SHA256 хеш
    const secret = crypto.createHmac('sha256', 'WebAppData')
      .update(config.telegramBot.token)
      .digest();

    const calculatedHash = crypto.createHmac('sha256', secret)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Ошибка валидации Telegram данных:', error);
    return false;
  }
};

// Форматирование даты в удобный формат
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);

  // Проверка на валидность даты
  if (isNaN(date.getTime())) {
    return dateStr; // Вернуть исходную строку, если дата невалидная
  }

  // Форматирование даты в формате "ДД.ММ.YYYY"
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

// Получение данных пользователя из Telegram WebApp
export const getUserDataFromInitData = (initData) => {
  if (!initData) return null;

  try {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');

    if (!userStr) return null;

    return JSON.parse(userStr);
  } catch (error) {
    console.error('Ошибка извлечения данных пользователя:', error);
    return null;
  }
};