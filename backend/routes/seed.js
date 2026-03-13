const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// ============ Demo Data Seeding ============

// Sample Products in Arabic/English
const sampleProducts = [
  // Electronics
  {
    name_ar: 'سماعات لاسلكية فاخرة',
    name_en: 'Premium Wireless Headphones',
    description_ar: 'سماعات فاخرة بتقنية الضوضاء النشطة',
    description_en: 'Premium headphones with active noise cancellation',
    category: 'Electronics',
    category_ar: 'الإلكترونيات',
    price: 450,
    stock: 85,
    image: '🎧',
    rating: 4.8,
    reviews: 156,
    vendor: 'Tech Store',
    tags: ['wireless', 'audio', 'noise-cancelling']
  },
  {
    name_ar: 'ساعة ذكية برو',
    name_en: 'Smart Watch Pro',
    description_ar: 'ساعة ذكية مع مراقبة القلب والنوم',
    description_en: 'Smart watch with heart rate monitoring',
    category: 'Electronics',
    category_ar: 'الإلكترونيات',
    price: 890,
    stock: 5,
    image: '⌚',
    rating: 4.9,
    reviews: 234,
    vendor: 'Tech Store',
    tags: ['wearable', 'health', 'smart']
  },
  {
    name_ar: 'شاحن سريع 65 وات',
    name_en: 'Fast Charger 65W',
    description_ar: 'شاحن سريع متوافق مع معظم الأجهزة',
    description_en: 'Universal fast charger compatible with most devices',
    category: 'Electronics',
    category_ar: 'الإلكترونيات',
    price: 120,
    stock: 200,
    image: '⚡',
    rating: 4.6,
    reviews: 89,
    vendor: 'Tech Store',
    tags: ['charger', 'fast-charging', 'universal']
  },

  // Fashion
  {
    name_ar: 'فستان ربيعي فاخر',
    name_en: 'Spring Collection Dress',
    description_ar: 'فستان مريح وأنيق للربيع',
    description_en: 'Comfortable and stylish spring dress',
    category: 'Fashion',
    category_ar: 'الأزياء',
    price: 320,
    stock: 45,
    image: '👗',
    rating: 4.6,
    reviews: 89,
    vendor: 'Fashion Hub',
    tags: ['dress', 'spring', 'feminine']
  },
  {
    name_ar: 'حذاء رياضي احترافي',
    name_en: 'Professional Running Shoes',
    description_ar: 'أحذية رياضية عالية الجودة للركض',
    description_en: 'High-quality sports shoes for running',
    category: 'Fashion',
    category_ar: 'الأزياء',
    price: 550,
    stock: 0,
    image: '👟',
    rating: 4.4,
    reviews: 67,
    vendor: 'Fashion Hub',
    tags: ['shoes', 'sports', 'running']
  },
  {
    name_ar: 'معطف شتوي دافئ',
    name_en: 'Winter Warm Jacket',
    description_ar: 'معطف شتوي دافئ ومريح',
    description_en: 'Warm and comfortable winter jacket',
    category: 'Fashion',
    category_ar: 'الأزياء',
    price: 450,
    stock: 32,
    image: '🧥',
    rating: 4.7,
    reviews: 112,
    vendor: 'Fashion Hub',
    tags: ['jacket', 'winter', 'warm']
  },

  // Home & Garden
  {
    name_ar: 'كرسي مكتب حديث',
    name_en: 'Modern Office Chair',
    description_ar: 'كرسي مكتب مريح وقابل للتعديل',
    description_en: 'Comfortable and adjustable office chair',
    category: 'Home & Garden',
    category_ar: 'المنزل والحديقة',
    price: 1200,
    stock: 12,
    image: '🛋️',
    rating: 4.5,
    reviews: 45,
    vendor: 'Home Décor',
    tags: ['furniture', 'office', 'ergonomic']
  },
  {
    name_ar: 'مصباح حديث مزخرف',
    name_en: 'Modern Decorative Lamp',
    description_ar: 'مصباح فني حديث لتزيين المنزل',
    description_en: 'Modern artistic lamp for home decoration',
    category: 'Home & Garden',
    category_ar: 'المنزل والحديقة',
    price: 280,
    stock: 56,
    image: '💡',
    rating: 4.3,
    reviews: 34,
    vendor: 'Home Décor',
    tags: ['lighting', 'decor', 'modern']
  },

  // Beauty & Care
  {
    name_ar: 'مجموعة العناية بالبشرة',
    name_en: 'Skincare Starter Kit',
    description_ar: 'مجموعة متكاملة للعناية بالبشرة',
    description_en: 'Complete skincare set for all skin types',
    category: 'Beauty & Care',
    category_ar: 'العناية والجمال',
    price: 210,
    stock: 0,
    image: '💄',
    rating: 4.7,
    reviews: 123,
    vendor: 'Beauty Plus',
    tags: ['skincare', 'beauty', 'cosmetics']
  },
  {
    name_ar: 'ماسك الوجه الطبيعي',
    name_en: 'Natural Face Mask',
    description_ar: 'ماسك وجه طبيعي من الطين البركاني',
    description_en: 'Natural face mask from volcanic clay',
    category: 'Beauty & Care',
    category_ar: 'العناية والجمال',
    price: 95,
    stock: 180,
    image: '🧖',
    rating: 4.5,
    reviews: 78,
    vendor: 'Beauty Plus',
    tags: ['mask', 'natural', 'skincare']
  }
];

// Sample Orders
const sampleOrders = [
  {
    orderId: 'ORD-001',
    userId: 'user_123',
    items: [
      { productName: 'Premium Wireless Headphones', quantity: 1, price: 450 },
      { productName: 'Fast Charger 65W', quantity: 2, price: 120 }
    ],
    totalAmount: 690,
    status: 'delivered',
    paymentStatus: 'completed',
    shippingAddress: '123 Nile Street, Cairo, Egypt',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-002',
    userId: 'user_124',
    items: [
      { productName: 'Spring Collection Dress', quantity: 1, price: 320 }
    ],
    totalAmount: 364,
    status: 'shipped',
    paymentStatus: 'completed',
    shippingAddress: '456 Tahrir Square, Cairo, Egypt',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-003',
    userId: 'user_125',
    items: [
      { productName: 'Modern Office Chair', quantity: 1, price: 1200 },
      { productName: 'Modern Decorative Lamp', quantity: 1, price: 280 }
    ],
    totalAmount: 1764,
    status: 'processing',
    paymentStatus: 'completed',
    shippingAddress: '789 Zamalek, Cairo, Egypt',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

// Sample Customers
const sampleCustomers = [
  {
    name_ar: 'أحمد حسن',
    name_en: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phone: '+20 123 456 7890',
    status: 'active',
    joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    totalOrders: 24,
    totalSpent: 12450,
    segment: 'VIP'
  },
  {
    name_ar: 'فاطمة أحمد',
    name_en: 'Fatima Ahmed',
    email: 'fatima@example.com',
    phone: '+20 123 456 7891',
    status: 'active',
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    totalOrders: 8,
    totalSpent: 3200,
    segment: 'Regular'
  },
  {
    name_ar: 'محمد علي',
    name_en: 'Mohammed Ali',
    email: 'mohammed@example.com',
    phone: '+20 123 456 7892',
    status: 'inactive',
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    totalOrders: 1,
    totalSpent: 450,
    segment: 'Occasional'
  },
  {
    name_ar: 'نور علي',
    name_en: 'Noor Ali',
    email: 'noor@example.com',
    phone: '+20 123 456 7893',
    status: 'active',
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    totalOrders: 3,
    totalSpent: 1200,
    segment: 'New'
  }
];

// ============ Seed Routes ============

// Seed all data
router.post('/seed-all', async (req, res) => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});

    // Seed Products with timestamps
    const productsWithTimestamps = sampleProducts.map(p => ({
      ...p,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));

    const products = await Product.insertMany(productsWithTimestamps);
    console.log(`✅ ${products.length} products seeded`);

    // Seed Orders with timestamps
    const orders = await Order.insertMany(sampleOrders);
    console.log(`✅ ${orders.length} orders seeded`);

    // Seed Customers
    const customers = await User.insertMany(sampleCustomers);
    console.log(`✅ ${customers.length} customers seeded`);

    res.json({
      message: '✅ Seeding completed successfully',
      stats: {
        products: products.length,
        orders: orders.length,
        customers: customers.length,
        totalValue: sampleOrders.reduce((sum, o) => sum + o.totalAmount, 0) + ' EGP'
      }
    });
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Seed only products
router.post('/seed-products', async (req, res) => {
  try {
    await Product.deleteMany({});
    
    const productsWithTimestamps = sampleProducts.map(p => ({
      ...p,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));

    const products = await Product.insertMany(productsWithTimestamps);
    res.json({
      message: `✅ ${products.length} products seeded`,
      products: products.length,
      categories: [...new Set(sampleProducts.map(p => p.category))]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed only orders
router.post('/seed-orders', async (req, res) => {
  try {
    await Order.deleteMany({});
    const orders = await Order.insertMany(sampleOrders);
    res.json({
      message: `✅ ${orders.length} orders seeded`,
      orders: orders.length,
      totalValue: sampleOrders.reduce((sum, o) => sum + o.totalAmount, 0) + ' EGP'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed only customers
router.post('/seed-customers', async (req, res) => {
  try {
    await User.deleteMany({});
    const customers = await User.insertMany(sampleCustomers);
    res.json({
      message: `✅ ${customers.length} customers seeded`,
      customers: customers.length,
      activeCount: sampleCustomers.filter(c => c.status === 'active').length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get seeding status
router.get('/seed-status', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const customerCount = await User.countDocuments();

    res.json({
      status: 'OK',
      data: {
        products: productCount,
        orders: orderCount,
        customers: customerCount,
        ready: productCount > 0 && orderCount > 0 && customerCount > 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all demo data
router.post('/clear-all', async (req, res) => {
  try {
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});

    res.json({
      message: '✅ All data cleared successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
