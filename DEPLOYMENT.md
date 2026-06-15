# 🚀 JOVIA FUBI PORTFOLIO — DEPLOYMENT GUIDE

**Complete step-by-step guide for deploying your professional portfolio to the web**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Gmail account with 2FA enabled
- [ ] Generated Gmail App Password
- [ ] Firebase project with service account
- [ ] Updated `.env` with all credentials
- [ ] Tested contact form locally (`npm start`)
- [ ] Changed default admin credentials
- [ ] Updated portfolio content (projects, about, experience)
- [ ] GitHub repository created and code pushed

---

## 🌍 Option 1: Heroku (Recommended for Beginners)

Heroku is the easiest option. Free tier available (limitations apply).

### Step-by-Step

1. **Create Heroku Account**
   - Visit https://heroku.com
   - Sign up with email

2. **Install Heroku CLI**
   ```bash
   # Mac/Linux
   brew install heroku/brew/heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   
   # Verify installation
   heroku --version
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   # Opens browser to authenticate
   ```

4. **Create Heroku App**
   ```bash
   heroku create jovia-fubi-portfolio
   # Note the URL given (e.g., https://jovia-fubi-portfolio.herokuapp.com)
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set PORT=4000
   heroku config:set NODE_ENV=production
   heroku config:set ADMIN_USER=your_username
   heroku config:set ADMIN_PASS=your_strong_password
   heroku config:set SESSION_SECRET=your_random_secret
   heroku config:set SMTP_HOST=smtp.gmail.com
   heroku config:set SMTP_PORT=587
   heroku config:set SMTP_SECURE=false
   heroku config:set SMTP_USER=your-email@gmail.com
   heroku config:set SMTP_PASS=your_app_password
   heroku config:set ADMIN_EMAIL=your-email@gmail.com
   heroku config:set SITE_URL=https://jovia-fubi-portfolio.herokuapp.com
   ```

6. **Upload Firebase Service Account**
   ```bash
   # Option A: Via config var (copy-paste content)
   heroku config:set GOOGLE_APPLICATION_CREDENTIALS=./ServiceAccount.json
   
   # Option B: Environment variables (recommended for security)
   # Contact Heroku support for large credentials
   ```

7. **Deploy Code**
   ```bash
   git push heroku main
   # or
   git push heroku master
   ```

8. **View Live Application**
   ```bash
   heroku open
   # Opens your portfolio in browser
   ```

9. **Monitor Logs**
   ```bash
   heroku logs --tail
   # Shows real-time logs
   ```

### Heroku Dashboard
- View app: https://dashboard.heroku.com/apps
- Monitor: Resources, Logs, Settings
- Scale: Change dyno type if needed

---

## 🌍 Option 2: Render.com (Free Tier, No Limits)

Render offers generous free tier suitable for portfolios.

### Step-by-Step

1. **Create Account**
   - Visit https://render.com
   - Sign up with GitHub account (recommended)

2. **Connect GitHub**
   - Click "Dashboard"
   - "New +" → "Web Service"
   - Connect your GitHub repo

3. **Configure Service**
   - Name: `jovia-fubi-portfolio`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

4. **Add Environment Variables**
   - Click "Environment"
   - Add each variable from your `.env`:
     ```
     ADMIN_USER = your_username
     ADMIN_PASS = your_strong_password
     SESSION_SECRET = random_secret
     SMTP_HOST = smtp.gmail.com
     SMTP_PORT = 587
     SMTP_USER = your-email@gmail.com
     SMTP_PASS = app_password
     ADMIN_EMAIL = your-email@gmail.com
     SITE_URL = https://your-app.onrender.com
     ```

5. **Handle Firebase Credentials**
   - Copy entire content of `ServiceAccount.json`
   - In Render, add environment variable:
     ```
     SERVICE_ACCOUNT_JSON = {paste entire JSON content}
     ```

6. **Deploy**
   - Click "Create Web Service"
   - Automatic deployment on GitHub push

7. **View Live**
   - Render provides URL: `https://your-app.onrender.com`
   - Check logs in dashboard

### Important Notes
- Free tier spins down after 15 minutes of inactivity
- First request takes 30 seconds (spin-up time)
- Upgrade to paid for instant response

---

## 🌍 Option 3: DigitalOcean (Most Affordable)

DigitalOcean offers $5-6/month servers and simple app platform.

### Using DigitalOcean App Platform (Easiest)

1. **Create Account**
   - Visit https://digitalocean.com
   - Sign up

2. **Create App**
   - Dashboard → Apps
   - "Create Apps" → "GitHub"
   - Select your portfolio repo

3. **Configure**
   - Runtime: Node.js
   - Build: `npm install`
   - Run: `npm start`

4. **Environment Variables**
   - Add all from `.env`
   - Add SITE_URL with your domain

5. **Add Domain**
   - Point your domain to DigitalOcean
   - Update SITE_URL in environment

### Using DigitalOcean Droplet (More Control)

```bash
# SSH into your droplet
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Clone repository
git clone https://github.com/your-username/portfolio.git
cd portfolio

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your environment variables

# Install PM2 (process manager)
npm install -g pm2

# Start application
pm2 start server.js --name "portfolio"
pm2 startup
pm2 save

# Install Nginx (reverse proxy)
apt install -y nginx

# Configure Nginx
nano /etc/nginx/sites-available/default
```

Replace Nginx config default with:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test and reload
nginx -t
systemctl reload nginx

# Install SSL (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your_domain.com
```

---

## 🌍 Option 4: AWS EC2 (Advanced)

For production deployments requiring maximum control.

1. **Create EC2 Instance**
   - Launch Ubuntu 20.04 LTS instance
   - Configure security groups (allow ports 80, 443, 22)

2. **SSH and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   git clone your-repo
   cd portfolio
   npm install
   ```

3. **Environment & Secrets**
   - Use AWS Systems Manager Parameter Store for secrets
   - Or create `.env` file (less secure)

4. **Process Management**
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   ```

5. **Web Server (Nginx + SSL)**
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   # Configure as shown above
   ```

---

## 🔐 Security Checklist for Production

- [ ] Change default admin credentials
- [ ] Generate strong SESSION_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Remove console.log() statements
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Use environment variables for all secrets
- [ ] Enable firewall
- [ ] Regular backups of Firebase data
- [ ] Monitor logs for errors

---

## 🌐 Custom Domain Setup

### Using a Custom Domain

1. **Register Domain**
   - GoDaddy, Namecheap, Google Domains, etc.

2. **Point to Hosting**
   
   **For Heroku:**
   ```bash
   heroku domains:add your-domain.com
   # Update DNS records with values shown
   ```
   
   **For Render/DigitalOcean/AWS:**
   - Login to domain registrar
   - Update DNS A record to point to your server IP
   - Update SITE_URL in `.env`

3. **Enable HTTPS**
   - Most platforms auto-enable (Let's Encrypt)
   - Takes 5-30 minutes to activate

4. **Update Environment**
   ```bash
   SITE_URL=https://your-domain.com
   ```

---

## 🧪 Testing Production Deployment

After deployment:

1. **Test Contact Form**
   - Fill out form
   - Check email inbox for confirmation
   - Check admin email for notification

2. **Test Admin Panel**
   - Login at `/login.html`
   - View messages in `/admin.html`
   - Reply to a message

3. **Check Logs**
   ```bash
   # Heroku
   heroku logs --tail
   
   # Render
   # View in dashboard
   
   # DigitalOcean
   pm2 logs
   ```

4. **Performance Test**
   - https://gtmetrix.com
   - Check response times
   - Optimize if needed

---

## 🔧 Troubleshooting Deployment

### Application Won't Start
```bash
# Check logs
heroku logs --tail

# Check package.json
node_modules/.bin/npm list

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check Gmail app password (not regular password)
- Verify 2FA is enabled
- Check "Less secure apps" setting if used

### Firebase Connection Error
- Verify ServiceAccount.json content
- Check GOOGLE_APPLICATION_CREDENTIALS
- Verify Firebase project is active
- Check Firestore permissions

### Port Issues
- Don't hardcode port in code
- Use environment variable: `const port = process.env.PORT || 4000`

---

## 📊 Monitoring & Maintenance

### Regular Tasks
- Weekly: Check contact messages and respond
- Monthly: Review logs and errors
- Quarterly: Update dependencies
- Annually: Renew SSL certificates

### Monitoring Services (Optional)
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, Datadog

---

## 🚀 Post-Deployment

1. **Update Profile Links**
   - LinkedIn: Add portfolio URL
   - GitHub: Link to portfolio repo
   - Resume: Include portfolio link

2. **Share Your Portfolio**
   - Email to contacts
   - LinkedIn posts
   - GitHub profile
   - Twitter/X if applicable

3. **Monitor & Respond**
   - Check messages daily
   - Respond within 24 hours
   - Keep portfolio updated

---

## 📞 Support Resources

- **Heroku Docs**: https://devcenter.heroku.com
- **Render Docs**: https://render.com/docs
- **DigitalOcean Docs**: https://docs.digitalocean.com
- **Node.js Best Practices**: https://nodejs.org/docs
- **Firebase Docs**: https://firebase.google.com/docs

---

**Your portfolio is now live! 🎉**

Remember to keep your content fresh, respond to inquiries promptly, and celebrate every opportunity that comes through your portfolio.

Good luck, Jovia! 🚀
