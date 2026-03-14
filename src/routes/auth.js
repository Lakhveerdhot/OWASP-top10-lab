const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Vulnerable login - SQL Injection
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Intentionally vulnerable SQL query
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    db.get(query, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (user) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Vulnerable registration - No input validation
router.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    // Intentionally vulnerable - no input validation or sanitization
    const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    db.run(query, [username, password, email], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Registration failed' });
        }
        res.redirect('/login');
    });
});

// Password reset - Vulnerable to CSRF
router.post('/reset-password', (req, res) => {
    const { newPassword } = req.body;
    const userId = req.session.user.id;
    // Intentionally vulnerable - no CSRF token
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    db.run(query, [newPassword, userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Password reset failed' });
        }
        res.json({ success: true });
    });
});

module.exports = router;