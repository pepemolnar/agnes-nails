# Agnes Nails - Deployment Quick Reference

Quick command reference for managing your production deployment.

## Daily Operations

### View Logs
```bash
cd ~/apps/agnes-nails
docker compose -f docker-compose.prod.yml logs -f [service-name]
```

### Restart Services
```bash
# All services
docker compose -f docker-compose.prod.yml restart

# Specific service
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
docker compose -f docker-compose.prod.yml restart nginx
```

### Check Service Status
```bash
docker compose -f docker-compose.prod.yml ps
docker ps
```

## Updates and Deployments

### Deploy Code Updates
```bash
cd ~/apps/agnes-nails
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Update Environment Variables
```bash
nano .env.production
docker compose -f docker-compose.prod.yml restart
```

### Rebuild Specific Service
```bash
docker compose -f docker-compose.prod.yml up -d --build backend
```

## Database Operations

### Manual Backup
```bash
cd ~/apps/agnes-nails
./scripts/backup.sh
```

### View Backups
```bash
ls -lh /var/backups/agnes-nails/
```

### Restore Database
```bash
gunzip -c /var/backups/agnes-nails/agnes_nails_backup_YYYYMMDD_HHMMSS.sql.gz | \
docker exec -i agnes-postgres-prod psql -U postgres -d agnes_nails
```

### Database Shell Access
```bash
docker exec -it agnes-postgres-prod psql -U postgres -d agnes_nails
```

## SSL Certificate Management

### Check Certificate Status
```bash
docker compose -f docker-compose.prod.yml run --rm certbot certificates
```

### Renew Certificate Manually
```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

## Troubleshooting

### View All Container Logs
```bash
docker compose -f docker-compose.prod.yml logs
```

### Check Container Health
```bash
docker ps
docker inspect agnes-backend-prod
```

### Restart Everything
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Clean Docker Resources
```bash
docker system prune -a
```

### Check Disk Space
```bash
df -h
du -sh /var/lib/docker
```

## System Maintenance

### Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Check Firewall Status
```bash
sudo ufw status
```

### View System Resource Usage
```bash
htop
# or
top
```

### Check Failed Login Attempts
```bash
sudo tail -f /var/log/auth.log
```

## Service Management (Systemd)

### Check Service Status
```bash
sudo systemctl status agnes-nails
```

### Restart Service
```bash
sudo systemctl restart agnes-nails
```

### View Service Logs
```bash
sudo journalctl -u agnes-nails -f
```

## Emergency Procedures

### Stop All Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Start Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Force Rebuild Everything
```bash
docker compose -f docker-compose.prod.yml down
docker system prune -a
docker compose -f docker-compose.prod.yml up -d --build
```

## Monitoring Commands

### Watch Container Resource Usage
```bash
docker stats
```

### Check Nginx Access Logs
```bash
docker logs agnes-nginx | tail -f
```

### Check Backend API Logs
```bash
docker logs agnes-backend-prod -f
```

### Check PostgreSQL Logs
```bash
docker logs agnes-postgres-prod -f
```

## Quick Fixes

### Backend Not Responding
```bash
docker compose -f docker-compose.prod.yml restart backend
docker logs agnes-backend-prod
```

### Frontend Not Loading
```bash
docker compose -f docker-compose.prod.yml restart frontend
docker logs agnes-frontend-prod
```

### Database Connection Error
```bash
docker compose -f docker-compose.prod.yml restart postgres
docker logs agnes-postgres-prod
```

### SSL/HTTPS Not Working
```bash
docker compose -f docker-compose.prod.yml restart nginx
docker logs agnes-nginx
```

## Important File Locations

- **Application**: `~/apps/agnes-nails/`
- **Environment Config**: `~/apps/agnes-nails/.env.production`
- **Nginx Config**: `~/apps/agnes-nails/nginx/nginx.conf`
- **SSL Certificates**: `~/apps/agnes-nails/certbot/conf/`
- **Database Backups**: `/var/backups/agnes-nails/`
- **Systemd Service**: `/etc/systemd/system/agnes-nails.service`

## Support Contacts

- Documentation: See DEPLOYMENT.md for full guide
- Logs: Always check logs first when troubleshooting
- Community: GitHub Issues or your support channel
