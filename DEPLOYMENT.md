# Agnes Nails - VPS Deployment Guide

This guide will walk you through deploying Agnes Nails to a VPS (Virtual Private Server) from scratch.

## Prerequisites

- A VPS with at least 2GB RAM, 1 CPU, and 25GB storage
- Ubuntu 22.04 LTS (recommended) or similar Linux distribution
- A domain name pointed to your VPS IP address
- Basic command line knowledge

## Recommended VPS Providers

1. **DigitalOcean** - $6-12/month - Beginner-friendly with excellent documentation
2. **Hetzner** - $4-8/month - Best value, EU-based
3. **Linode** - $5-12/month - Good balance of features and price

## Part 1: Initial VPS Setup

### Step 1: Connect to Your VPS

```bash
ssh root@your_vps_ip_address
```

### Step 2: Update System Packages

```bash
apt update && apt upgrade -y
```

### Step 3: Create a Non-Root User

```bash
# Create user
adduser deploy

# Add to sudo group
usermod -aG sudo deploy

# Switch to new user
su - deploy
```

### Step 4: Set Up Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### Step 5: Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Log out and back in for group changes to take effect
exit
# Then ssh back in: ssh deploy@your_vps_ip_address

# Verify installation
docker --version
docker compose version
```

### Step 6: Install Git

```bash
sudo apt install git -y
```

## Part 2: Deploy Your Application

### Step 1: Clone Your Repository

```bash
# Create apps directory
mkdir -p ~/apps
cd ~/apps

# Clone your repository
git clone https://github.com/your-username/agnes-nails.git
cd agnes-nails
```

**Note**: If your repository is private, you'll need to set up SSH keys or use a personal access token.

### Step 2: Configure Environment Variables

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit the file with secure values
nano .env.production
```

Fill in these **CRITICAL** values:

```bash
# Database - Use a strong password!
DATABASE_PASSWORD=your_very_strong_password_here

# JWT Secret - Use a random 32+ character string
JWT_SECRET=generate_a_long_random_string_here_min_32_chars

# reCAPTCHA keys (get from https://www.google.com/recaptcha/admin)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# API URL - Use your actual domain
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

**To generate a secure JWT secret**:
```bash
openssl rand -base64 48
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Update Nginx Configuration

```bash
nano nginx/nginx.conf
```

Find the line `server_name _;` and replace `_` with your domain:
```nginx
server_name your-domain.com www.your-domain.com;
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Build and Start the Application

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Check if containers are running
docker ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

You should see 5 containers running:
- agnes-postgres-prod
- agnes-backend-prod
- agnes-frontend-prod
- agnes-nginx
- agnes-certbot

Press `Ctrl+C` to exit logs.

### Step 5: Verify the Application

Visit `http://your-domain.com` in a browser. You should see your application!

**Note**: At this point, it's running on HTTP (not secure). We'll add HTTPS in the next part.

## Part 3: Set Up SSL/HTTPS with Let's Encrypt

### Step 1: Obtain SSL Certificate

```bash
# Make sure your domain is pointing to your VPS IP
# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Request certificate (replace with your domain and email)
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d your-domain.com \
    -d www.your-domain.com

# Start nginx again
docker compose -f docker-compose.prod.yml start nginx
```

### Step 2: Enable HTTPS in Nginx

```bash
nano nginx/nginx.conf
```

1. **Comment out** the HTTP server block (lines with the initial setup comment)
2. **Uncomment** the HTTP redirect block
3. **Uncomment** the HTTPS server block
4. **Replace** `your-domain.com` with your actual domain in the HTTPS block
5. **Replace** the SSL certificate paths with your domain:
   ```nginx
   ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
   ```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Restart Nginx

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

### Step 4: Verify HTTPS

Visit `https://your-domain.com` - you should see a secure connection with a lock icon!

## Part 4: Set Up Automatic Startup

### Create Systemd Service

This ensures your application starts automatically when the VPS reboots.

```bash
# Create service file
sudo nano /etc/systemd/system/agnes-nails.service
```

Paste this content (replace `/home/deploy/apps/agnes-nails` with your actual path):

```ini
[Unit]
Description=Agnes Nails Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/deploy/apps/agnes-nails
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
User=deploy

[Install]
WantedBy=multi-user.target
```

Save and exit, then enable the service:

```bash
sudo systemctl enable agnes-nails.service
sudo systemctl start agnes-nails.service
sudo systemctl status agnes-nails.service
```

## Part 5: Set Up Database Backups

### Step 1: Make Backup Script Executable

```bash
chmod +x scripts/backup.sh
```

### Step 2: Test Backup

```bash
./scripts/backup.sh
```

Check if backup was created:
```bash
ls -lh /var/backups/agnes-nails/
```

### Step 3: Schedule Automatic Backups

```bash
# Edit crontab
crontab -e
```

Add this line to run backups daily at 2 AM:
```bash
0 2 * * * cd /home/deploy/apps/agnes-nails && ./scripts/backup.sh >> /var/log/agnes-nails-backup.log 2>&1
```

Save and exit.

## Part 6: Monitoring and Maintenance

### View Application Logs

```bash
cd ~/apps/agnes-nails

# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Update Application

```bash
cd ~/apps/agnes-nails

# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Check Disk Space

```bash
df -h
```

### Clean Up Docker Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

### Restore Database from Backup

```bash
# List available backups
ls -lh /var/backups/agnes-nails/

# Restore from backup (replace filename with your backup)
gunzip -c /var/backups/agnes-nails/agnes_nails_backup_YYYYMMDD_HHMMSS.sql.gz | \
docker exec -i agnes-postgres-prod psql -U postgres -d agnes_nails
```

## Security Best Practices

1. **Change Default Admin Password**: After first deployment, log in to `/admin/login` with `admin/admin123` and immediately change the password in the database.

2. **Keep System Updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Monitor Failed Login Attempts**:
   ```bash
   sudo tail -f /var/log/auth.log
   ```

4. **Set Up SSH Key Authentication** (disable password login):
   ```bash
   # On your local machine, generate SSH key if you don't have one
   ssh-keygen -t ed25519

   # Copy public key to VPS
   ssh-copy-id deploy@your_vps_ip

   # Test SSH key login
   ssh deploy@your_vps_ip

   # Disable password authentication
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no

   # Restart SSH
   sudo systemctl restart sshd
   ```

5. **Install Fail2Ban** (blocks repeated failed login attempts):
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

## Troubleshooting

### Application Won't Start

```bash
# Check container status
docker ps -a

# Check logs for errors
docker compose -f docker-compose.prod.yml logs

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### Database Connection Error

```bash
# Check if postgres is running
docker ps | grep postgres

# Check database logs
docker logs agnes-postgres-prod

# Verify environment variables
cat .env.production
```

### SSL Certificate Issues

```bash
# Check certificate status
docker compose -f docker-compose.prod.yml run --rm certbot certificates

# Manually renew certificate
docker compose -f docker-compose.prod.yml run --rm certbot renew
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker resources
docker system prune -a

# Check large directories
du -sh /* | sort -h
```

## Getting Help

- Check application logs for error messages
- Verify environment variables are set correctly
- Ensure firewall allows traffic on ports 80 and 443
- Confirm domain DNS is pointing to your VPS IP
- Check Docker container health: `docker ps`

## Next Steps

1. **Custom Domain Configuration**: Update DNS A records to point to your VPS IP
2. **Email Notifications**: Configure SMTP for appointment confirmations (requires code changes)
3. **Monitoring**: Set up monitoring with tools like Uptime Robot or StatusCake
4. **Analytics**: Add Google Analytics or similar (requires code changes)
5. **Performance**: Enable Cloudflare for CDN and DDoS protection

## Costs Estimate

- **VPS**: $4-12/month
- **Domain**: $10-15/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$5-15/month

Congratulations! Your Agnes Nails application is now live on a production server!
