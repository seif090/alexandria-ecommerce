/**
 * Alexandria Last Chance - Demo Data Seed Script
 * Generates realistic Egyptian/Alexandrian data for showcase
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const generateDemoData = async (User, Product, Order, Review) => {
  try {
    console.log('🌱 Seeding Alexandria Last Chance Demo Data...\n');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    // ============ VENDORS ============
    const vendors = [
      {
        name: 'Ahmed Hassan',
        email: 'sidi-gaber-fashion@alexchance.com',
        password: await bcrypt.hash('vendor123', 10),
        role: 'vendor',
        shopName: 'Sidi Gaber Fashion Hub',
        category: 'Fashion',
        shopLogo: 'https://via.placeholder.com/150?text=Sidi+Gaber',
        shopDescription: 'Premium clearance fashion in Alexandria\'s hottest district',
        loyalty: { points: 5200, tier: 'Diamond', referralCode: 'SGFH-2026' },
        subscription: { plan: 'pro', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      {
        name: 'Fatima Mohamed',
        email: 'miami-gadgets@alexchance.com',
        password: await bcrypt.hash('vendor123', 10),
        role: 'vendor',
        shopName: 'Miami Electronics Outlet',
        category: 'Electronics',
        shopLogo: 'https://via.placeholder.com/150?text=Miami+Electronics',
        shopDescription: 'Latest tech deals at unbeatable prices',
        loyalty: { points: 3800, tier: 'Gold', referralCode: 'MEO-2026' },
        subscription: { plan: 'pro', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      {
        name: 'Youssef Ibrahim',
        email: 'smouha-grocers@alexchance.com',
        password: await bcrypt.hash('vendor123', 10),
        role: 'vendor',
        shopName: 'Smouha Fresh Grocers',
        category: 'Grocery',
        shopLogo: 'https://via.placeholder.com/150?text=Smouha+Grocers',
        shopDescription: 'Fresh produce and bulk food clearance',
        loyalty: { points: 6100, tier: 'Diamond', referralCode: 'SFG-2026' },
        subscription: { plan: 'premium', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      {
        name: 'Layla Mansour',
        email: 'victoria-shoes@alexchance.com',
        password: await bcrypt.hash('vendor123', 10),
        role: 'vendor',
        shopName: 'Victoria Shoe Gallery',
        category: 'Shoes',
        shopLogo: 'https://via.placeholder.com/150?text=Victoria+Shoes',
        shopDescription: 'Designer footwear at clearance prices',
        loyalty: { points: 2400, tier: 'Silver', referralCode: 'VSG-2026' },
        subscription: { plan: 'free', expiresAt: null }
      }
    ];

    const createdVendors = await User.insertMany(vendors);
    console.log(`✅ Created ${createdVendors.length} vendors\n`);

    // ============ CUSTOMERS ============
    const customers = [
      {
        name: 'Mariam El-Sayed',
        email: 'mariam.elsayed@gmail.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'user',
        loyalty: { points: 1250, tier: 'Silver', referralCode: 'MARIAM-2026' }
      },
      {
        name: 'Omar Khaled',
        email: 'omar.khaled@yahoo.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'user',
        loyalty: { points: 3890, tier: 'Gold', referralCode: 'OMAR-2026' }
      },
      {
        name: 'Noura Amr',
        email: 'noura.amr@gmail.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'user',
        loyalty: { points: 850, tier: 'Bronze', referralCode: 'NOURA-2026' }
      },
      {
        name: 'Karim Hassan',
        email: 'karim.hassan@gmail.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'user',
        loyalty: { points: 5600, tier: 'Diamond', referralCode: 'KARIM-2026' }
      }
    ];

    const createdCustomers = await User.insertMany(customers);
    console.log(`✅ Created ${createdCustomers.length} customers\n`);

    // ============ PRODUCTS ============
    const products = [
      // Sidi Gaber Fashion Vendor
      {
        name: 'Premium Cotton T-Shirt Collection',
        description: 'Summer collection overflow - 100% cotton comfort wear',
        category: 'Fashion',
        originalPrice: 350,
        discountPrice: 145,
        stockCount: 45,
        images: ['https://via.placeholder.com/400x300?text=T-Shirt'],
        vendor: createdVendors[0]._id,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isFeatured: true
      },
      {
        name: 'Designer Denim Jeans - Various Sizes',
        description: 'Last season jeans at 60% off - stock clearance',
        category: 'Fashion',
        originalPrice: 1200,
        discountPrice: 450,
        stockCount: 23,
        images: ['https://via.placeholder.com/400x300?text=Denim+Jeans'],
        vendor: createdVendors[0]._id,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Summer Sundresses Bundle',
        description: 'Women\'s casual dresses - perfect for Alexandria summer',
        category: 'Fashion',
        originalPrice: 800,
        discountPrice: 280,
        stockCount: 67,
        images: ['https://via.placeholder.com/400x300?text=Sundress'],
        vendor: createdVendors[0]._id,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },

      // Miami Electronics Vendor
      {
        name: 'Wireless Bluetooth Headphones Pro',
        description: 'Noise-canceling, 40-hour battery life',
        category: 'Electronics',
        originalPrice: 1800,
        discountPrice: 890,
        stockCount: 12,
        images: ['https://via.placeholder.com/400x300?text=Headphones'],
        vendor: createdVendors[1]._id,
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        isFeatured: true
      },
      {
        name: 'Portable Power Bank 30000mAh',
        description: 'Fast charging with dual USB ports',
        category: 'Electronics',
        originalPrice: 550,
        discountPrice: 220,
        stockCount: 89,
        images: ['https://via.placeholder.com/400x300?text=Power+Bank'],
        vendor: createdVendors[1]._id,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'HD USB Webcam Bundle',
        description: '1080p clarity for streaming and calls',
        category: 'Electronics',
        originalPrice: 420,
        discountPrice: 165,
        stockCount: 34,
        images: ['https://via.placeholder.com/400x300?text=Webcam'],
        vendor: createdVendors[1]._id,
        expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Smart LED Light Strips RGB',
        description: 'App-controlled ambient lighting - 10m length',
        category: 'Electronics',
        originalPrice: 680,
        discountPrice: 320,
        stockCount: 56,
        images: ['https://via.placeholder.com/400x300?text=LED+Strips'],
        vendor: createdVendors[1]._id,
        expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
      },

      // Smouha Grocers
      {
        name: 'Premium Date Selection Box',
        description: 'Bulk dates assortment - perfect for Ramadan preparation',
        category: 'Grocery',
        originalPrice: 280,
        discountPrice: 130,
        stockCount: 156,
        images: ['https://via.placeholder.com/400x300?text=Dates'],
        vendor: createdVendors[2]._id,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Organic Extra Virgin Olive Oil - 3L Bottles',
        description: 'Egyptian/Mediterranean blend - bulk pricing',
        category: 'Grocery',
        originalPrice: 950,
        discountPrice: 580,
        stockCount: 42,
        images: ['https://via.placeholder.com/400x300?text=Olive+Oil'],
        vendor: createdVendors[2]._id,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Spice Mix Collection - 20 varieties',
        description: 'Traditional Alexandria spice blends - wholesale',
        category: 'Grocery',
        originalPrice: 420,
        discountPrice: 195,
        stockCount: 78,
        images: ['https://via.placeholder.com/400x300?text=Spices'],
        vendor: createdVendors[2]._id,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },

      // Victoria Shoes
      {
        name: 'Leather Oxford Shoes - Multiple Colors',
        description: 'Premium leather dress shoes - last season',
        category: 'Shoes',
        originalPrice: 1600,
        discountPrice: 650,
        stockCount: 18,
        images: ['https://via.placeholder.com/400x300?text=Oxford+Shoes'],
        vendor: createdVendors[3]._id,
        expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Comfortable Running Sneakers',
        description: 'Sports footwear with gel cushioning',
        category: 'Shoes',
        originalPrice: 900,
        discountPrice: 380,
        stockCount: 41,
        images: ['https://via.placeholder.com/400x300?text=Sneakers'],
        vendor: createdVendors[3]._id,
        expiryDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // ============ ORDERS ============
    const orders = [
      {
        items: [
          { product: createdProducts[0]._id, quantity: 2, price: 145 },
          { product: createdProducts[1]._id, quantity: 1, price: 450 }
        ],
        totalAmount: 740,
        vendor: createdVendors[0]._id,
        user: createdCustomers[0]._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        items: [
          { product: createdProducts[3]._id, quantity: 1, price: 890 }
        ],
        totalAmount: 890,
        vendor: createdVendors[1]._id,
        user: createdCustomers[1]._id,
        status: 'processing',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        items: [
          { product: createdProducts[6]._id, quantity: 5, price: 130 }
        ],
        totalAmount: 650,
        vendor: createdVendors[2]._id,
        user: createdCustomers[2]._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        items: [
          { product: createdProducts[9]._id, quantity: 1, price: 650 }
        ],
        totalAmount: 650,
        vendor: createdVendors[3]._id,
        user: createdCustomers[3]._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders\n`);

    // ============ REVIEWS ============
    const reviews = [
      {
        product: createdProducts[0]._id,
        user: createdCustomers[0]._id,
        rating: 5,
        comment: 'ممتاز! جودة عالية والسعر رائع جداً. Excellent quality and amazing price! Will definitely buy again.',
        helpful: 42,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        product: createdProducts[3]._id,
        user: createdCustomers[1]._id,
        rating: 4,
        comment: 'Great headphones! Sound quality is excellent. Battery lasts forever.',
        helpful: 28,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        product: createdProducts[6]._id,
        user: createdCustomers[2]._id,
        rating: 5,
        comment: 'التمر طازج جداً وجودة عالية. Very fresh and high quality dates!',
        helpful: 15,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        product: createdProducts[2]._id,
        user: createdCustomers[0]._id,
        rating: 4,
        comment: 'Beautiful designs and comfortable. Highly recommend!',
        helpful: 33,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        product: createdProducts[4]._id,
        user: createdCustomers[1]._id,
        rating: 5,
        comment: 'Power bank works perfectly. Charges my phone 3x. Best deal!',
        helpful: 51,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdReviews = await Review.insertMany(reviews);
    console.log(`✅ Created ${createdReviews.length} reviews\n`);

    console.log('🎉 Demo Data Seeding Complete!\n');
    console.log('📊 SUMMARY:');
    console.log(`   - Vendors: ${createdVendors.length}`);
    console.log(`   - Customers: ${createdCustomers.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Reviews: ${createdReviews.length}`);
    console.log('\n🔑 DEMO CREDENTIALS:');
    console.log('   Vendor: sidi-gaber-fashion@alexchance.com / vendor123');
    console.log('   Customer: mariam.elsayed@gmail.com / customer123');

    return { createdVendors, createdCustomers, createdProducts, createdOrders, createdReviews };
  } catch (err) {
    console.error('❌ Seed Error:', err);
    throw err;
  }
};

module.exports = { generateDemoData };
