const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const Database = require('better-sqlite3');
const http = require('http'); // For SSRF demo
const fs = require('fs'); // For JSON file operations

const app = express();
const db = new Database(path.join(__dirname, 'db', 'database.sqlite'), { verbose: console.log });

// Middleware setup
app.use(helmet()); // Basic security headers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'insecure-secret-key', // VULNERABILITY: Hardcoded secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // VULNERABILITY: Non-secure cookie
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Prepare database statements
const getUserById = db.prepare('SELECT * FROM users WHERE id = ?');
const getAllUsers = db.prepare('SELECT * FROM users');

// AUTO-SAVE: Save database to JSON file in data folder (PRIVATE - not exposed on website)
function saveDatabaseToJSON() {
    try {
        const users = getAllUsers.all();
        const posts = db.prepare('SELECT * FROM posts').all();
        
        const data = {
            timestamp: new Date().toISOString(),
            users: users,
            posts: posts
        };
        
        // Create data folder if it doesn't exist
        const dataFolder = path.join(__dirname, 'data');
        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder, { recursive: true });
        }
        
        const jsonPath = path.join(dataFolder, 'database_export.json');
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        
        console.log(`[✓] Database exported to: ${jsonPath}`);
    } catch (err) {
        console.error('[✗] Failed to export database:', err.message);
    }
}

// Save database automatically on startup
saveDatabaseToJSON();

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null, success: null });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // VULNERABILITY: SQL Injection through string interpolation
    try {
        const result = db.exec(`INSERT INTO users (username, email, password_hash, role) VALUES ('${username}', '${email}', '${password}', 'user')`);
        
        // Auto-save to JSON file after registration
        saveDatabaseToJSON();
        
        res.render('register', { error: null, success: 'Registration successful! Please login.' });
    } catch (err) {
        res.render('register', { error: err.message, success: null });
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // VULNERABILITY: SQL Injection through string interpolation
    try {
        const user = db.prepare(`SELECT * FROM users WHERE username = '${username}' AND password_hash = '${password}'`).get();
        
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (err) {
        res.render('login', { error: 'Login failed: ' + err.message });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// VULNERABILITY: Broken Access Control
app.get('/profile/:id', (req, res) => {
    // No authentication check
    const user = getUserById.get(req.params.id);
    res.render('vuln', { 
        name: 'User Profile',
        description: 'Displaying user profile without authentication check',
        data: user 
    });
});

// VULNERABILITY: Sensitive Data Exposure
app.get('/sensitive', (req, res) => {
    const users = getAllUsers.all();
    res.render('vuln', {
        title: 'Sensitive Data',
        data: users
    });
});

// Auto-save database every 60 seconds
setInterval(saveDatabaseToJSON, 60000);

// VULNERABILITY: SQL Injection
app.get('/search', (req, res) => {
    res.render('search', { results: [] });
});

app.post('/search', (req, res) => {
    const { q } = req.body;
    // VULNERABILITY: SQL Injection through string interpolation
    const results = db.prepare(`SELECT * FROM posts WHERE title LIKE '%${q}%'`).all();
    res.render('search', { results: results });
});

// VULNERABILITY: CSRF
app.get('/transfer', (req, res) => {
    res.render('transfer');
});

app.post('/transfer', (req, res) => {
    // VULNERABILITY: No CSRF token validation
    const { amount, to } = req.body;
    
    if (req.session.user) {
        // Simulate successful transfer
        res.json({ success: true, message: `Successfully transferred ${amount} points to ${to}` });
    } else {
        res.json({ success: false, message: 'You must be logged in to transfer points' });
    }
});

// VULNERABILITY: Reflected XSS
app.get('/reflected-xss', (req, res) => {
    const { name } = req.query;
    if (name) {
        // VULNERABILITY: Reflected XSS - user input not escaped
        res.render('reflected-xss', { message: `Hello, ${name}!` });
    } else {
        res.render('reflected-xss', { message: null });
    }
});

// VULNERABILITY: SSRF
app.get('/fetch', (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.render('fetch', { url: '' });
    }

    // VULNERABILITY: No URL validation
    http.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => res.render('fetch', { url, result: data }));
    }).on('error', (err) => {
        res.render('fetch', { url, result: `Error: ${err.message}` });
    });
});

// Per-vulnerability explanation pages (links from home)
app.get('/vuln/sqli', (req, res) => {
    res.render('vuln_sqli');
});

app.get('/vuln/csrf', (req, res) => {
    res.render('vuln_csrf');
});

app.get('/vuln/ssrf', (req, res) => {
    res.render('vuln_ssrf');
});

app.get('/vuln/sensitive', (req, res) => {
    res.render('vuln_sensitive');
});

app.get('/vuln/broken-access', (req, res) => {
    res.render('vuln_broken_access');
});

app.get('/vuln/xss', (req, res) => {
    res.render('vuln_xss');
});

// Simple page for Broken Authentication concepts
app.get('/vuln/auth', (req, res) => {
    res.render('vuln_auth', { });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Vulnerable server running at http://localhost:${PORT}`);
    console.log('WARNING: This server contains intentional vulnerabilities for educational purposes!');
});