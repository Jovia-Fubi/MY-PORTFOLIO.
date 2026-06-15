# Jovia Fubi — Professional Portfolio Website

**A modern, production-ready portfolio website for Jovia Fubi — Network Systems & Cybersecurity Specialist.**

- **Live Demo**: Coming Soon
- **Built with**: Node.js, Express, Firebase, Nodemailer
- **Hosting**: Ready for Heroku, AWS, DigitalOcean, Render, or any Node.js host

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Google Firebase account
- Gmail account (for email notifications)

### Installation

1. **Clone or extract the project**
   ```bash
   cd jovia-fubi-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in:
   - `SMTP_USER` and `SMTP_PASS` (Gmail credentials)
   - `ADMIN_EMAIL` (where contact messages are sent)
   - Admin credentials

4. **Ensure ServiceAccount.json is in the root**
   This file contains your Firebase credentials.

5. **Start the development server**
   ```bash
   npm start
   ```
   Visit `http://localhost:4000`

---

## ⚙️ Configuration

### Email Setup (Critical for Contact Form)

**Using Gmail:**

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
   - Device: "Mail" → "Windows Computer" (or your device)
   - Copy the 16-character password
3. In `.env`:
   ```
   SMTP_USER=joviafubi312@gmail.com
   SMTP_PASS= Livinghope@74
   ADMIN_EMAIL=joviafubi312@gmail.com
   ```

**Using Other SMTP (SendGrid, Mailgun, etc.):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-key
```

### Firebase Setup

Your `ServiceAccount.json` should contain:
```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key": "...",
  "client_email": "..."
}
```

**Never commit this file!** It's already in `.gitignore`.

---

## 📁 Project Structure

```
jovia-fubi-portfolio/
├── Index.html          # Main portfolio page (production-ready)
├── admin.html          # Admin panel (messages dashboard)
├── login.html          # Admin login page
├── server.js           # Node.js backend (Express)
├── package.json        # Dependencies & scripts
├── .env               # Environment variables (NEVER commit)
├── .gitignore         # Git ignore rules
├── ServiceAccount.json # Firebase credentials (NEVER commit)
└── README.md          # This file
```

---

## 🔧 Features

### For Visitors
✅ Beautiful, modern portfolio design  
✅ Fully responsive (desktop, tablet, mobile)  
✅ Direct email contact form  
✅ Automatic confirmation emails to visitors  
✅ Projects & experience showcase  
✅ Blog section (coming soon)  
✅ LinkedIn & GitHub integration  

### For Admin (You)
✅ Secure admin dashboard (`/admin.html`)  
✅ View all contact messages in real-time  
✅ Reply to messages directly (sends email to visitor)  
✅ Message status tracking (new/replied/archived)  
✅ Admin authentication with session management  

---

## 📧 Email Flow

**When a visitor submits the contact form:**

1. **Visitor receives** → Automatic confirmation email
2. **Admin receives** → Notification email with message details
3. **Admin replies** → Email sent directly to visitor's inbox
4. **All messages stored** → In Firebase for history

---

## 🔐 Security

- ✅ Environment variables for sensitive data (`.env`)
- ✅ Password hashing with SHA-256
- ✅ Session-based admin authentication
- ✅ CSRF protection via Express middleware
- ✅ Input validation and sanitization
- ✅ Rate limiting ready (can add)
- ✅ HTTPS recommended for production

---

## 📦 Deployment

### Option 1: Heroku (Easiest)

1. **Create Heroku account** → https://heroku.com
2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```
3. **Create app**
   ```bash
   heroku create jovia-fubi-portfolio
   ```
4. **Set environment variables**
   ```bash
   heroku config:set SMTP_USER=your-email@gmail.com
   heroku config:set SMTP_PASS=xxxx xxxx xxxx xxxx
   heroku config:set ADMIN_EMAIL=your-email@gmail.com
   ```
5. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: Render (Free Tier)

1. Go to https://render.com
2. Connect GitHub repo
3. Create Web Service
4. Set environment variables in dashboard
5. Deploy automatically on push

### Option 3: DigitalOcean App Platform

1. Create DigitalOcean account
2. Connect GitHub repo
3. Select Node.js buildpack
4. Add environment variables
5. Deploy

### Option 4: AWS/Google Cloud/Azure

Use standard Node.js deployment procedures for your cloud platform.

---

## 🚦 Environment Variables Reference

```env
# Server
PORT=4000
NODE_ENV=production

# Admin
ADMIN_USER=admin
ADMIN_PASS=change_me_to_strong_password
SESSION_SECRET=change_me_to_random_string

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
ADMIN_EMAIL=your-email@gmail.com

# Website
SITE_URL=https://yourdomain.com
```

---

## 🛠️ Common Issues & Solutions

### "Email not sending"
- Verify SMTP_USER and SMTP_PASS in `.env`
- Check Gmail app password (not regular password)
- Ensure 2FA is enabled on Gmail
- Check server logs: `npm start`

### "Firebase connection fails"
- Verify `ServiceAccount.json` is in project root
- Check Firebase credentials validity
- Ensure Firebase project is active

### "Admin login not working"
- Default credentials: `admin` / `password123`
- Check `.env` ADMIN_USER and ADMIN_PASS
- Clear browser cookies and try again

### "Port already in use"
- Change PORT in `.env`: `PORT=5000`
- Or kill process: `lsof -i :4000` then `kill -9 <PID>`

---

## 📚 API Endpoints

### Contact Form
```
POST /api/messages
Body: { name, email, country, subject, message }
Response: { success: true, id: "doc_id" }
```

### Admin Messages (requires auth)
```
GET /api/messages          → List all messages
GET /api/messages/:id      → Get single message
POST /api/messages/:id/reply → Send reply email
```

### Authentication
```
POST /login                → Admin login
POST /signup               → Create admin account
GET /logout                → Logout
```

---

## 🎯 Next Steps

1. **Update content**
   - Edit `Index.html` with your actual projects
   - Update tech stack and skills
   - Add real GitHub links

2. **Configure email**
   - Set up Gmail app password
   - Update ADMIN_EMAIL in `.env`

3. **Deploy**
   - Choose hosting platform (Heroku, Render, etc.)
   - Set environment variables
   - Deploy and test

4. **Monitor**
   - Check admin dashboard regularly
   - Respond to contact messages promptly
   - Update portfolio with new projects

---

## 📞 Support & Feedback

For issues or questions:
- Check browser console for errors: `F12` → Console
- Check server logs: `npm start`
- Verify `.env` configuration
- Review Firebase Firestore status

---

## 📄 License

© 2025 Jovia Fubi. All rights reserved.

---

**Built with ❤️ for a professional online presence**
