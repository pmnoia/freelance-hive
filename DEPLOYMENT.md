# 🚀 FreelanceHive VM Deployment Guide

## Prerequisites on VM

- Ubuntu 20.04+ or similar
- Node.js 18+ installed
- PM2 installed globally
- Nginx installed
- Git installed

## 📋 Step-by-Step Deployment

### 1. **Prepare Your VM**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git (if not installed)
sudo apt install git -y
```

### 2. **Clone & Setup Application**

```bash
# Navigate to home directory
cd /home/ubuntu

# Clone your repository
git clone https://github.com/pmnoia/freelance-hive.git
cd freelance-hive

# Make deployment script executable
chmod +x deploy.sh

# Copy environment file
cp .env.production .env.local
```

### 3. **Configure Nginx**

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/freelance-hive

# Enable the site
sudo ln -s /etc/nginx/sites-available/freelance-hive /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 4. **Deploy Application**

```bash
# Run deployment script
./deploy.sh
```

### 5. **Verify Deployment**

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs freelance-hive

# Check if app is responding
curl http://localhost:3002/freelance-hive

# Check nginx status
sudo systemctl status nginx
```

## 🌐 Access Your Application

Your FreelanceHive should now be accessible at:

- **URL**: `http://YOUR_VM_IP/freelance-hive`
- **Example**: `http://203.0.113.1/freelance-hive`

## 🔧 Common Issues & Solutions

### **Issue 1: Port 3002 in use**

```bash
sudo lsof -i :3002
sudo kill -9 <PID>
pm2 restart freelance-hive
```

### **Issue 2: Nginx not serving static files**

```bash
# Check permissions
ls -la /home/ubuntu/freelance-hive/.next/
sudo chown -R www-data:www-data /home/ubuntu/freelance-hive/.next/static/
```

### **Issue 3: MongoDB connection issues**

- Ensure your MongoDB Atlas allows connections from VM IP
- Check if `.env.local` has correct MongoDB URI

### **Issue 4: Build fails**

```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 📊 Monitoring Commands

```bash
# Monitor all PM2 processes
pm2 monit

# View logs in real-time
pm2 logs freelance-hive --lines 50

# Restart application
pm2 restart freelance-hive

# Stop application
pm2 stop freelance-hive

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔄 Updates & Redeployment

To update your application:

```bash
cd /home/ubuntu/freelance-hive
git pull origin main
./deploy.sh
```

## 🎯 Production Checklist

- [ ] VM has Node.js 18+
- [ ] PM2 installed globally
- [ ] Nginx configured and running
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Firewall allows HTTP (port 80)
- [ ] Application accessible via browser
- [ ] PM2 auto-restart working
- [ ] Logs are being generated

## 🛡️ Security Notes

- Consider setting up SSL/HTTPS with Let's Encrypt
- Configure firewall to only allow necessary ports
- Regularly update system packages
- Monitor application logs for security issues

Your FreelanceHive is now production-ready! 🎉
