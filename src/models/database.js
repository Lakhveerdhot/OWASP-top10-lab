const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../data/vuln.db'), (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

function initDatabase() {
    // Users table - Intentionally vulnerable to SQL injection
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        email TEXT,
        role TEXT DEFAULT 'user'
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        image_url TEXT
    )`);

    // Comments table - Vulnerable to XSS
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table - For CSRF testing
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert some sample data
    insertSampleData();
}

function insertSampleData() {
    // Sample users with weak passwords
    const users = [
        ['admin', 'admin123', 'admin@test.com', 'admin'],
        ['user1', 'password123', 'user1@test.com', 'user'],
        ['test', 'test123', 'test@test.com', 'user']
    ];

    users.forEach(user => {
        db.run('INSERT OR IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            user, (err) => {
                if (err) console.error('Error inserting user:', err);
            });
    });

    // Sample products
    const products = [
        ['Laptop', 'High-end gaming laptop', 999.99, '/images/laptop.jpg'],
        ['Smartphone', 'Latest model smartphone', 599.99, '/images/phone.jpg'],
        ['Tablet', 'Professional tablet with stylus', 449.99, '/images/tablet.jpg']
    ];

    products.forEach(product => {
        db.run('INSERT OR IGNORE INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)',
            product, (err) => {
                if (err) console.error('Error inserting product:', err);
            });
    });
}

module.exports = db;