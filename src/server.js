const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'vulnerable-secret-for-testing',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Intentionally vulnerable
}));

// Static files
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));
app.use('/products', require('./routes/products'));
app.use('/profile', require('./routes/profile'));

// Vulnerable endpoints for testing
app.use('/vuln', require('./routes/vulnerable'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});