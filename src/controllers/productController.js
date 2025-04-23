import googleSheetsService from '../services/googleSheetsService.js';

// Получение всех категорий
export const getCategories = async (req, res) => {
  try {
    const categories = await googleSheetsService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ success: false, error: 'Ошибка при получении категорий' });
  }
};

// Получение всех продуктов или по категории
export const getProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const products = await googleSheetsService.getProducts(categoryId || null);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ success: false, error: 'Ошибка при получении продуктов' });
  }
};

// Поиск продуктов
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, error: 'Параметр запроса не может быть пустым' });
    }

    const products = await googleSheetsService.searchProducts(query);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Ошибка при поиске продуктов:', error);
    res.status(500).json({ success: false, error: 'Ошибка при поиске продуктов' });
  }
};

// Получение одного продукта по ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const allProducts = await googleSheetsService.getProducts();
    const product = allProducts.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Продукт не найден' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Ошибка при получении продукта:', error);
    res.status(500).json({ success: false, error: 'Ошибка при получении продукта' });
  }
};