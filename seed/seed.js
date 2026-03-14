const Database = require('better-sqlite3');
const path = require('path');

// Create/connect to database
const db = new Database(path.join(__dirname, '..', 'db', 'database.sqlite'), { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = OFF'); // Temporarily disable for table drops

// Drop existing tables
db.exec(`
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS users;
`);

// Create tables
db.exec(`
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

// Re-enable foreign keys
db.pragma('foreign_keys = ON');

// Prepare insert statements
const insertUser = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
const insertPost = db.prepare('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)');

// Insert users
// Note: In a real application, these passwords should be properly hashed
const users = [
    { username: 'alice', email: 'alice@test.com', password: 'alice123', role: 'user' },
    { username: 'bob', email: 'bob@test.com', password: 'bob123', role: 'user' },
    { username: 'admin', email: 'admin@test.com', password: 'admin123', role: 'admin' }
];

users.forEach(user => {
    insertUser.run(user.username, user.email, user.password, user.role);
});

// Insert posts
const posts = [
    {
        user_id: 1, // alice
        title: 'First Post',
        content: 'Hello, this is my first post!'
    },
    {
        user_id: 2, // bob
        title: 'Security Thoughts',
        content: 'We should always be mindful of security in our applications.'
    }
];

posts.forEach(post => {
    insertPost.run(post.user_id, post.title, post.content);
});

console.log('Database seeded');

// Close the database connection
db.close();