import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, ''));
  }
});
const upload = multer({ storage });

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadDir));

// Simple in-memory session store
const activeTokens = new Set<string>();

// Auth Middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  next();
};

// Initialize SQLite Database
const db = new Database('perfume.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    images TEXT DEFAULT '[]',
    price REAL NOT NULL,
    topNotes TEXT NOT NULL,
    heartNotes TEXT NOT NULL,
    baseNotes TEXT NOT NULL,
    gender TEXT DEFAULT 'Unisex',
    scentFamilies TEXT DEFAULT '[]',
    concentration TEXT DEFAULT 'EDP',
    stockThreshold INTEGER DEFAULT 5,
    tags TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    size TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_region TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'New',
    tracking_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    variant_id INTEGER,
    product_name TEXT NOT NULL,
    variant_size TEXT,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    region TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    segment TEXT DEFAULT 'Regular'
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cms_pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS active_carts (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    items TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed default home config
const defaultHomeConfig = {
  announcement: { text: "Бесплатная доставка от 150 BYN", active: true },
  hero: {
    slides: [
      {
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop",
        title: "Искусство минимализма",
        subtitle: "Найдите свой идеальный аромат.",
        link: "/catalog"
      }
    ]
  },
  featuredProductsTitle: "Новые поступления",
  featuredProductIds: [1, 2, 3],
  promoImages: [
    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop"
  ],
  dynamicBlocks: [
    { type: 'New', title: 'Новинки', active: true },
    { type: 'BestSellers', title: 'Хиты продаж', active: true },
    { type: 'Recommended', title: 'Рекомендуем', active: true }
  ]
};
db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run('home_config', JSON.stringify(defaultHomeConfig));

// Migration for new columns
const migrations = [
  "ALTER TABLE products ADD COLUMN gender TEXT DEFAULT 'Unisex'",
  "ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]'",
  "ALTER TABLE products ADD COLUMN scentFamilies TEXT DEFAULT '[]'",
  "ALTER TABLE products ADD COLUMN concentration TEXT DEFAULT 'EDP'",
  "ALTER TABLE products ADD COLUMN stockThreshold INTEGER DEFAULT 5",
  "ALTER TABLE products ADD COLUMN tags TEXT DEFAULT '[]'"
];

for (const migration of migrations) {
  try {
    db.exec(migration);
  } catch (e) {
    // Column likely already exists
  }
}

// Insert some initial data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (count.count <= 2) {
  const insert = db.prepare(`
    INSERT INTO products (name, brand, description, imageUrl, price, topNotes, heartNotes, baseNotes, gender, scentFamilies)
    VALUES (@name, @brand, @description, @imageUrl, @price, @topNotes, @heartNotes, @baseNotes, @gender, @scentFamilies)
  `);
  
  if (count.count === 0) {
    insert.run({
      name: 'Santal 33',
      brand: 'Le Labo',
      description: 'Унисекс аромат, который передает дух американского Запада и личной свободы.',
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
      price: 320,
      topNotes: JSON.stringify([{name: 'Violet', value: 30}, {name: 'Cardamom', value: 70}]),
      heartNotes: JSON.stringify([{name: 'Iris', value: 40}, {name: 'Ambrox', value: 60}]),
      baseNotes: JSON.stringify([{name: 'Cedarwood', value: 50}, {name: 'Leather', value: 50}]),
      gender: 'Unisex',
      scentFamilies: JSON.stringify(['Woody'])
    });

    insert.run({
      name: 'Baccarat Rouge 540',
      brand: 'Maison Francis Kurkdjian',
      description: 'Светящийся и утонченный, Baccarat Rouge 540 ложится на кожу как амбровый, цветочный и древесный бриз.',
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
      price: 325,
      topNotes: JSON.stringify([{name: 'Saffron', value: 60}, {name: 'Jasmine', value: 40}]),
      heartNotes: JSON.stringify([{name: 'Amberwood', value: 80}, {name: 'Ambergris', value: 20}]),
      baseNotes: JSON.stringify([{name: 'Fir Resin', value: 40}, {name: 'Cedar', value: 60}]),
      gender: 'Unisex',
      scentFamilies: JSON.stringify(['Oriental', 'Floral'])
    });
  }

  // Add 8 more test products
  insert.run({
    name: 'Gypsy Water',
    brand: 'Byredo',
    description: 'Гламуризация цыганского образа жизни. Аромат свежей земли, густых лесов и костров.',
    imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop',
    price: 290,
    topNotes: JSON.stringify([{name: 'Bergamot', value: 40}, {name: 'Lemon', value: 60}]),
    heartNotes: JSON.stringify([{name: 'Pine Needle', value: 50}, {name: 'Orris', value: 50}]),
    baseNotes: JSON.stringify([{name: 'Amber', value: 40}, {name: 'Sandalwood', value: 60}]),
    gender: 'Unisex',
    scentFamilies: JSON.stringify(['Woody', 'Fresh'])
  });

  insert.run({
    name: 'Oud Wood',
    brand: 'Tom Ford',
    description: 'Редкий, экзотический, отличительный. Один из самых редких, драгоценных и дорогих ингредиентов в арсенале парфюмера.',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    price: 395,
    topNotes: JSON.stringify([{name: 'Rosewood', value: 50}, {name: 'Cardamom', value: 50}]),
    heartNotes: JSON.stringify([{name: 'Oud Wood', value: 70}, {name: 'Sandalwood', value: 30}]),
    baseNotes: JSON.stringify([{name: 'Tonka Bean', value: 40}, {name: 'Amber', value: 60}]),
    gender: 'Male',
    scentFamilies: JSON.stringify(['Woody', 'Oriental'])
  });

  insert.run({
    name: 'Aventus',
    brand: 'Creed',
    description: 'Начальные ноты просто невероятны. Очень уверенный и мужественный аромат, привлекающий внимание.',
    imageUrl: 'https://images.unsplash.com/photo-1615397323734-20a2234d2081?q=80&w=800&auto=format&fit=crop',
    price: 495,
    topNotes: JSON.stringify([{name: 'Pineapple', value: 40}, {name: 'Bergamot', value: 60}]),
    heartNotes: JSON.stringify([{name: 'Birch', value: 60}, {name: 'Patchouli', value: 40}]),
    baseNotes: JSON.stringify([{name: 'Musk', value: 50}, {name: 'Oakmoss', value: 50}]),
    gender: 'Male',
    scentFamilies: JSON.stringify(['Fresh', 'Woody'])
  });

  insert.run({
    name: 'Portrait of a Lady',
    brand: 'Frederic Malle',
    description: 'Огромная доза турецкой розы — 400 цветов на 100 мл флакон, не меньше. Под ней — сердце пачули, пропитанное сандалом и ладаном.',
    imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703bc48b12?q=80&w=800&auto=format&fit=crop',
    price: 390,
    topNotes: JSON.stringify([{name: 'Rose', value: 80}, {name: 'Clove', value: 20}]),
    heartNotes: JSON.stringify([{name: 'Patchouli', value: 60}, {name: 'Sandalwood', value: 40}]),
    baseNotes: JSON.stringify([{name: 'Frankincense', value: 50}, {name: 'Musk', value: 50}]),
    gender: 'Female',
    scentFamilies: JSON.stringify(['Floral', 'Oriental'])
  });

  insert.run({
    name: 'Lost Cherry',
    brand: 'Tom Ford',
    description: 'Полнотелое путешествие в некогда запретное; контрастный аромат, раскрывающий соблазнительную дихотомию игривого, конфетного блеска снаружи и сочной мякоти внутри.',
    imageUrl: 'https://images.unsplash.com/photo-1616934807977-170c05c75ea7?q=80&w=800&auto=format&fit=crop',
    price: 395,
    topNotes: JSON.stringify([{name: 'Black Cherry', value: 70}, {name: 'Bitter Almond', value: 30}]),
    heartNotes: JSON.stringify([{name: 'Rose Absolute', value: 40}, {name: 'Jasmine', value: 60}]),
    baseNotes: JSON.stringify([{name: 'Peru Balsam', value: 50}, {name: 'Roasted Tonka', value: 50}]),
    gender: 'Unisex',
    scentFamilies: JSON.stringify(['Gourmand', 'Oriental'])
  });

  insert.run({
    name: 'Delina',
    brand: 'Parfums de Marly',
    description: 'Очень нюансированный аромат, одновременно сладкий и чувственный. Парфюмерная вода наслаждается своими цветочными аккордами, в которых доминируют турецкая роза, ландыш и пион.',
    imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop',
    price: 355,
    topNotes: JSON.stringify([{name: 'Rhubarb', value: 50}, {name: 'Lychee', value: 50}]),
    heartNotes: JSON.stringify([{name: 'Turkish Rose', value: 60}, {name: 'Peony', value: 40}]),
    baseNotes: JSON.stringify([{name: 'Vanilla', value: 40}, {name: 'White Musk', value: 60}]),
    gender: 'Female',
    scentFamilies: JSON.stringify(['Floral'])
  });

  insert.run({
    name: 'Black Phantom',
    brand: 'Kilian',
    description: 'Смертельный кофе с каплей рома. Аромат открывается аккордом рома с Мартиники, похожим на «пиратскую воду», который пронзает аромат крепкого кофе в самом сердце.',
    imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop',
    price: 295,
    topNotes: JSON.stringify([{name: 'Rum', value: 60}, {name: 'Sugar Cane', value: 40}]),
    heartNotes: JSON.stringify([{name: 'Coffee', value: 70}, {name: 'Vetiver', value: 30}]),
    baseNotes: JSON.stringify([{name: 'Cyanide', value: 30}, {name: 'Sandalwood', value: 70}]),
    gender: 'Unisex',
    scentFamilies: JSON.stringify(['Gourmand', 'Oriental'])
  });

  insert.run({
    name: 'Mojave Ghost',
    brand: 'Byredo',
    description: 'Древесная композиция, вдохновленная душевной красотой пустыни Мохаве. В этой засушливой глуши редко встречаются растения, которые осмеливаются цвести.',
    imageUrl: 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=800&auto=format&fit=crop',
    price: 290,
    topNotes: JSON.stringify([{name: 'Ambrette', value: 50}, {name: 'Nesberry', value: 50}]),
    heartNotes: JSON.stringify([{name: 'Magnolia', value: 40}, {name: 'Sandalwood', value: 60}]),
    baseNotes: JSON.stringify([{name: 'Cedarwood', value: 50}, {name: 'Chantilly Musk', value: 50}]),
    gender: 'Unisex',
    scentFamilies: JSON.stringify(['Woody', 'Floral'])
  });
}

// Update existing records to have genders if they were created before the migration
db.exec(`
  UPDATE products SET gender = 'Male' WHERE name IN ('Oud Wood', 'Aventus') AND gender IS NULL;
  UPDATE products SET gender = 'Female' WHERE name IN ('Portrait of a Lady', 'Delina') AND gender IS NULL;
  UPDATE products SET gender = 'Unisex' WHERE gender IS NULL;
`);

// Update any existing picsum.photos to unsplash
db.prepare(`
  UPDATE products 
  SET imageUrl = CASE 
    WHEN name = 'Santal 33' THEN 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Baccarat Rouge 540' THEN 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Gypsy Water' THEN 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Oud Wood' THEN 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Aventus' THEN 'https://images.unsplash.com/photo-1615397323734-20a2234d2081?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Portrait of a Lady' THEN 'https://images.unsplash.com/photo-1595425970377-c9703bc48b12?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Lost Cherry' THEN 'https://images.unsplash.com/photo-1616934807977-170c05c75ea7?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Delina' THEN 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Black Phantom' THEN 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop'
    WHEN name = 'Mojave Ghost' THEN 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=800&auto=format&fit=crop'
    ELSE imageUrl
  END
  WHERE imageUrl LIKE '%picsum.photos%'
`).run();

// SEO Endpoints
app.get('/robots.txt', (req, res) => {
  const domain = req.protocol + '://' + req.get('host');
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /admin
Allow: /

Sitemap: ${domain}/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  try {
    const domain = req.protocol + '://' + req.get('host');
    const products = db.prepare('SELECT id FROM products').all() as { id: number }[];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/contacts</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/reviews</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    products.forEach(product => {
      xml += `
  <url>
    <loc>${domain}/product/${product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `\n</urlset>`;
    
    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// API Routes
app.get('/api/settings/home', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('home_config') as { value: string };
    if (row) {
      res.json(JSON.parse(row.value));
    } else {
      res.status(404).json({ error: 'Config not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

app.put('/api/settings/home', requireAuth, (req, res) => {
  try {
    const config = req.body;
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(JSON.stringify(config), 'home_config');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';

  if (username === adminUser && password === adminPass) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  res.status(204).send();
});

app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    const result = products.map((p: any) => {
      const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id);
      return {
        ...p,
        images: JSON.parse(p.images || '[]'),
        scentFamilies: JSON.parse(p.scentFamilies || '[]'),
        topNotes: JSON.parse(p.topNotes),
        heartNotes: JSON.parse(p.heartNotes),
        baseNotes: JSON.parse(p.baseNotes),
        tags: JSON.parse(p.tags || '[]'),
        variants
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Advanced Admin Dashboard Stats
app.get('/api/admin/dashboard', requireAuth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const salesToday = db.prepare("SELECT SUM(total) as total FROM orders WHERE date(created_at) = ? AND status != 'Cancelled'").get(today) as any;
    const salesWeek = db.prepare("SELECT SUM(total) as total FROM orders WHERE created_at >= date('now', '-7 days') AND status != 'Cancelled'").get() as any;
    const salesMonth = db.prepare("SELECT SUM(total) as total FROM orders WHERE created_at >= date('now', '-30 days') AND status != 'Cancelled'").get() as any;
    
    const activeCarts = db.prepare("SELECT COUNT(*) as count FROM active_carts WHERE updated_at >= date('now', '-1 hour')").get() as any;
    
    const totalViews = db.prepare("SELECT COUNT(*) as count FROM product_views WHERE viewed_at >= date('now', '-30 days')").get() as any;
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE created_at >= date('now', '-30 days')").get() as any;
    const conversion = totalViews.count > 0 ? (totalOrders.count / totalViews.count) * 100 : 0;

    const lowStock = db.prepare(`
      SELECT p.name, v.size, v.stock, p.stockThreshold 
      FROM product_variants v 
      JOIN products p ON v.product_id = p.id 
      WHERE v.stock <= p.stockThreshold
    `).all();

    const recentReviews = db.prepare("SELECT * FROM reviews WHERE status = 'Pending' ORDER BY created_at DESC LIMIT 5").all();

    res.json({
      metrics: {
        salesToday: salesToday?.total || 0,
        salesWeek: salesWeek?.total || 0,
        salesMonth: salesMonth?.total || 0,
        activeCarts: activeCarts.count,
        conversion: conversion.toFixed(2)
      },
      alerts: {
        lowStock,
        pendingReviews: recentReviews.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Orders Management
app.get('/api/admin/orders', requireAuth, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const result = orders.map((o: any) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      return { ...o, items };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/admin/orders/:id', requireAuth, (req, res) => {
  const { status, tracking_number } = req.body;
  try {
    db.prepare('UPDATE orders SET status = ?, tracking_number = ? WHERE id = ?')
      .run(status, tracking_number, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Users Management
app.get('/api/admin/users', requireAuth, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.*, 
             COUNT(o.id) as orderCount, 
             SUM(o.total) as ltv,
             AVG(o.total) as avgOrderValue
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
    `).all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Reviews Management
app.get('/api/admin/reviews', requireAuth, (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, p.name as productName 
      FROM reviews r 
      JOIN products p ON r.product_id = p.id 
      ORDER BY r.created_at DESC
    `).all();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.put('/api/admin/reviews/:id', requireAuth, (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// CMS Pages
app.get('/api/admin/cms', requireAuth, (req, res) => {
  try {
    const pages = db.prepare('SELECT * FROM cms_pages').all();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CMS pages' });
  }
});

app.put('/api/admin/cms/:id', requireAuth, (req, res) => {
  const { title, content } = req.body;
  try {
    db.prepare('INSERT OR REPLACE INTO cms_pages (id, title, content, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
      .run(req.params.id, title, content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update CMS page' });
  }
});

app.post('/api/products/:id/view', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    db.prepare('INSERT INTO product_views (product_id) VALUES (?)').run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to log view' });
  }
});

app.get('/api/reviews', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, p.name as productName 
      FROM reviews r 
      JOIN products p ON r.product_id = p.id 
      WHERE r.status = 'Approved' 
      ORDER BY r.created_at DESC
    `).all();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/products/:id/reviews', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const reviews = db.prepare("SELECT * FROM reviews WHERE product_id = ? AND status = 'Approved' ORDER BY created_at DESC").all(id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/products/:id/reviews', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { user_name, rating, comment } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (!user_name || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ratingNum = parseInt(rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  try {
    db.prepare('INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)')
      .run(id, user_name, ratingNum, comment);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.get('/api/stats/views', requireAuth, (req, res) => {
  const { period } = req.query;
  let dateFilter = '';
  if (period === '7days') {
    dateFilter = "AND viewed_at >= date('now', '-7 days')";
  } else if (period === '30days') {
    dateFilter = "AND viewed_at >= date('now', '-30 days')";
  }

  try {
    const stats = db.prepare(`
      SELECT p.id, p.name, p.brand, COUNT(v.id) as views
      FROM products p
      LEFT JOIN product_views v ON p.id = v.product_id ${dateFilter}
      GROUP BY p.id
      ORDER BY views DESC
    `).all();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/stats/views-over-time', requireAuth, (req, res) => {
  const { period } = req.query;
  let dateFilter = '';
  if (period === '7days') {
    dateFilter = "WHERE viewed_at >= date('now', '-7 days')";
  } else if (period === '30days') {
    dateFilter = "WHERE viewed_at >= date('now', '-30 days')";
  }

  try {
    const stats = db.prepare(`
      SELECT date(viewed_at) as date, COUNT(id) as views
      FROM product_views
      ${dateFilter}
      GROUP BY date(viewed_at)
      ORDER BY date(viewed_at) ASC
    `).all();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time stats' });
  }
});

app.post('/api/products', requireAuth, (req, res) => {
  const { name, brand, description, imageUrl, images, price, topNotes, heartNotes, baseNotes, gender, scentFamilies, concentration, stockThreshold, tags, variants } = req.body;
  
  try {
    const insert = db.prepare(`
      INSERT INTO products (name, brand, description, imageUrl, images, price, topNotes, heartNotes, baseNotes, gender, scentFamilies, concentration, stockThreshold, tags)
      VALUES (@name, @brand, @description, @imageUrl, @images, @price, @topNotes, @heartNotes, @baseNotes, @gender, @scentFamilies, @concentration, @stockThreshold, @tags)
    `);
    
    const result = insert.run({
      name, brand, description, imageUrl, 
      images: JSON.stringify(images || []),
      price,
      topNotes: JSON.stringify(topNotes || []),
      heartNotes: JSON.stringify(heartNotes || []),
      baseNotes: JSON.stringify(baseNotes || []),
      gender,
      scentFamilies: JSON.stringify(scentFamilies || []),
      concentration,
      stockThreshold,
      tags: JSON.stringify(tags || [])
    });
    
    const productId = result.lastInsertRowid;
    
    if (variants && Array.isArray(variants)) {
      const insertVariant = db.prepare('INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES (?, ?, ?, ?, ?)');
      for (const v of variants) {
        insertVariant.run(productId, v.size, v.price, v.stock, v.sku);
      }
    }
    
    res.status(201).json({ id: productId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put('/api/products/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, brand, description, imageUrl, images, price, topNotes, heartNotes, baseNotes, gender, scentFamilies, concentration, stockThreshold, tags, variants } = req.body;
  
  try {
    db.prepare(`
      UPDATE products 
      SET name = @name, brand = @brand, description = @description, imageUrl = @imageUrl, images = @images,
          price = @price, topNotes = @topNotes, heartNotes = @heartNotes, baseNotes = @baseNotes, gender = @gender,
          scentFamilies = @scentFamilies, concentration = @concentration, stockThreshold = @stockThreshold, tags = @tags
      WHERE id = @id
    `).run({
      id, name, brand, description, imageUrl,
      images: JSON.stringify(images || []),
      price,
      topNotes: JSON.stringify(topNotes || []),
      heartNotes: JSON.stringify(heartNotes || []),
      baseNotes: JSON.stringify(baseNotes || []),
      gender,
      scentFamilies: JSON.stringify(scentFamilies || []),
      concentration,
      stockThreshold,
      tags: JSON.stringify(tags || [])
    });

    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
    if (variants && Array.isArray(variants)) {
      const insertVariant = db.prepare('INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES (?, ?, ?, ?, ?)');
      for (const v of variants) {
        insertVariant.run(id, v.size, v.price, v.stock, v.sku);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Export Routes
app.get('/api/admin/export/:type', requireAuth, (req, res) => {
  const { type } = req.params;
  try {
    let data;
    if (type === 'products') {
      data = db.prepare('SELECT * FROM products').all();
    } else if (type === 'orders') {
      data = db.prepare('SELECT * FROM orders').all();
    } else if (type === 'users') {
      data = db.prepare('SELECT * FROM users').all();
    } else {
      return res.status(400).json({ error: 'Invalid export type' });
    }

    if (req.query.format === 'csv') {
      if (data.length === 0) return res.send('');
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row: any) => 
        Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      res.type('text/csv');
      res.attachment(`${type}_export.csv`);
      return res.send(`${headers}\n${rows}`);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.post('/api/callback', async (req, res) => {
  const { name, phone, message } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram credentials not configured. Simulating success.');
    return res.status(200).json({ success: true, simulated: true });
  }

  const text = `🔔 *Новая заявка на звонок*\n\n👤 *Имя:* ${name}\n📞 *Телефон:* ${phone}\n💬 *Сообщение:* ${message || 'Нет сообщения'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram message');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Telegram error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
