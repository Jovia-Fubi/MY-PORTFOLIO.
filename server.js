const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const session = require('express-session');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'jovia-admin-secret-dev',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Initialize Firebase Admin
const defaultKeyPaths = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  path.join(__dirname, 'serviceAccountKey.json'),
  path.join(__dirname, 'ServiceAccount.json'),
  path.join(__dirname, 'serviceAccount.json')
].filter(Boolean);

const serviceAccountPath = defaultKeyPaths.find(p => fs.existsSync(p));
if (!serviceAccountPath) {
  console.error('❌ Missing Firebase service account file.');
  console.error('Place serviceAccountKey.json, ServiceAccount.json, or set GOOGLE_APPLICATION_CREDENTIALS in the project root.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const PORT = process.env.PORT || 4000;

// Setup Email Transporter
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration on startup
smtpTransport.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Email configuration issue:', error.message);
  } else {
    console.log('✓ Email service ready');
  }
});

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/login.html');
}

function ensureAdminApi(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ success: false, error: 'Authentication required.' });
}

// Serve static files
app.use(express.static(path.join(__dirname)));

// SIGNUP ENDPOINT
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ success: false, error: 'Username must be 3-20 alphanumeric characters or underscore.' });
    }
    
    // Check if user already exists
    const userRef = db.collection('admins').doc(username.toLowerCase());
    const doc = await userRef.get();
    if (doc.exists) {
      return res.status(400).json({ success: false, error: 'Username is already taken.' });
    }

    const passwordHash = hashPassword(password);
    await userRef.set({
      username: username.toLowerCase(),
      email: email,
      passwordHash: passwordHash,
      createdAt: Date.now()
    });

    res.json({ success: true, message: 'Account created successfully.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Server error during signup.' });
  }
});

// LOGIN ENDPOINT
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'password123';

    // 1. Check env credentials first
    if (username === adminUser && password === adminPass) {
      req.session.authenticated = true;
      req.session.user = username;
      return res.json({ success: true, redirect: '/admin.html' });
    }

    // 2. Check Firestore admins collection
    if (username) {
      const userRef = db.collection('admins').doc(username.toLowerCase());
      const doc = await userRef.get();
      if (doc.exists) {
        const userData = doc.data();
        const inputHash = hashPassword(password);
        if (userData.passwordHash === inputHash) {
          req.session.authenticated = true;
          req.session.user = userData.username;
          return res.json({ success: true, redirect: '/admin.html' });
        }
      }
    }

    res.status(401).json({ success: false, error: 'Invalid credentials.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// LOGOUT ENDPOINT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// ADMIN PAGE (requires authentication)
app.get('/admin.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// GET ALL CONTACT MESSAGES (admin only)
app.get('/api/messages', ensureAdminApi, async (req, res) => {
  try {
    const snapshot = await db.collection('contact_messages').orderBy('ts', 'desc').limit(200).get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Unable to load messages.' });
  }
});

// GET SINGLE MESSAGE
app.get('/api/messages/:id', async (req, res) => {
  try {
    const doc = await db.collection('contact_messages').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Message not found.' });
    }
    res.json({ success: true, message: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Unable to load message.' });
  }
});

// REPLY TO MESSAGE (admin only)
app.post('/api/messages/:id/reply', ensureAdminApi, async (req, res) => {
  try {
    const { replyText, adminName = 'Jovia', sendEmail = false } = req.body;
    if (!replyText || replyText.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Reply text is required.' });
    }

    const ref = db.collection('contact_messages').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Message not found.' });
    }

    const data = doc.data();
    await ref.update({
      reply: {
        text: replyText,
        admin: adminName,
        repliedAt: Date.now()
      },
      status: 'replied'
    });

    // Send email if requested
    if (sendEmail && data.email && process.env.SMTP_USER) {
      try {
        await smtpTransport.sendMail({
          from: process.env.SMTP_USER,
          to: data.email,
          subject: `Re: ${data.subject || 'Your message'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hello ${data.name},</h2>
              <p>Thank you for reaching out. Here's Jovia's response:</p>
              <div style="background:#f5f5f5;padding:15px;border-left:4px solid #64FFDA;margin:20px 0">
                <p>${replyText.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="margin-top:20px;font-size:12px;color:#999">
                — ${adminName} | Jovia Fubi Portfolio
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.warn('Email send failed:', emailError.message);
      }
    }

    res.json({ success: true, message: 'Reply saved' + (sendEmail ? ' and email sent' : '') });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, error: 'Server error saving reply.' });
  }
});

// SUBMIT CONTACT MESSAGE
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, country, subject, message } = req.body;

    // Validate inputs
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    // Basic sanitization
    const cleanData = {
      name: String(name).substring(0, 100),
      email: String(email).substring(0, 100),
      country: String(country || 'Other').substring(0, 50),
      subject: String(subject || 'No Subject').substring(0, 200),
      message: String(message).substring(0, 5000),
      ts: Date.now(),
      status: 'new',
      ip: req.ip || 'unknown'
    };

    // Save to Firestore
    const docRef = await db.collection('contact_messages').add(cleanData);

    // Send confirmation email to visitor
    if (process.env.SMTP_USER) {
      try {
        await smtpTransport.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: 'Message Received - Jovia Fubi Portfolio',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hello ${name},</h2>
              <p>Thank you for reaching out! I've received your message and will get back to you as soon as possible.</p>
              <div style="background:#f5f5f5;padding:15px;border-left:4px solid #64FFDA;margin:20px 0">
                <p><strong>Subject:</strong> ${cleanData.subject}</p>
                <p><strong>Your Message:</strong></p>
                <p>${cleanData.message.replace(/\n/g, '<br>')}</p>
              </div>
              <p>Best regards,<br><strong>Jovia Fubi</strong><br>Network Systems & Cybersecurity Specialist<br>Uganda 🇺🇬</p>
              <p style="margin-top:30px;font-size:12px;color:#999">
                This is an automated response. If you need urgent assistance, please reply to this email.
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.warn('Confirmation email failed:', emailError.message);
      }
    }

    // Send admin notification
    if (process.env.SMTP_USER && process.env.ADMIN_EMAIL) {
      try {
        await smtpTransport.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `New Contact Message from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New Contact Message</h2>
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Country:</strong> ${cleanData.country}</p>
              <p><strong>Subject:</strong> ${cleanData.subject}</p>
              <div style="background:#f5f5f5;padding:15px;border-left:4px solid #64FFDA;margin:20px 0">
                <p>${cleanData.message.replace(/\n/g, '<br>')}</p>
              </div>
              <p><a href="${process.env.SITE_URL || 'http://localhost:4000'}/admin.html" style="background:#64FFDA;color:#0A192F;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block">View in Admin Panel</a></p>
            </div>
          `
        });
      } catch (emailError) {
        console.warn('Admin notification failed:', emailError.message);
      }
    }

    res.json({ success: true, id: docRef.id, message: 'Message received successfully!' });
  } catch (error) {
    console.error('Save message error:', error);
    res.status(500).json({ success: false, error: 'Server error saving message.' });
  }
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════╗
  ║  JOVIA FUBI PORTFOLIO SERVER      ║
  ║  🚀 Running on port ${PORT}          ║
  ║  🌍 Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚═══════════════════════════════════╝
  `);
});
