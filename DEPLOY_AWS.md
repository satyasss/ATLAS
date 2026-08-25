# Atlas deployment on AWS EC2

This guide deploys React, Spring Boot, and MySQL on one Ubuntu EC2 instance.
Docker Compose runs the application. Host Nginx handles the public domain and
HTTPS. Only Nginx is public; the application container is bound to localhost,
and the backend and database have no host ports.

## 1. Create the AWS server

Create an EC2 instance with:

- Ubuntu Server 24.04 LTS (64-bit x86)
- `t3.medium` or larger (2 vCPU and 4 GB RAM is a comfortable starting point)
- 30-50 GB gp3 EBS storage
- An Elastic IP attached to the instance

Security group inbound rules:

| Port | Source | Purpose |
|---|---|---|
| 22 | Your own public IP only | SSH |
| 80 | `0.0.0.0/0`, `::/0` | HTTP and certificate setup |
| 443 | `0.0.0.0/0`, `::/0` | HTTPS |

Do not expose ports 3000, 3306, or 8080.

If using a domain, create `A` records for the root domain and `www` pointing to
the Elastic IP. Wait until DNS resolves before requesting HTTPS.

## 2. Connect and install software

```bash
ssh -i /path/to/key.pem ubuntu@YOUR_ELASTIC_IP

sudo apt update
sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git
sudo systemctl enable --now docker nginx
sudo usermod -aG docker ubuntu

# Add 2 GB swap so image builds do not exhaust a 4 GB instance.
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
exit
```

Reconnect so the Docker group takes effect:

```bash
ssh -i /path/to/key.pem ubuntu@YOUR_ELASTIC_IP
docker --version
docker compose version
```

## 3. Copy the application

For a public repository:

```bash
sudo mkdir -p /opt/atlas
sudo chown ubuntu:ubuntu /opt/atlas
git clone YOUR_GIT_REPOSITORY_URL /opt/atlas
cd /opt/atlas
```

For a private repository, use a GitHub deploy key or copy the repository with
`scp`. Do not put a personal access token inside the clone URL or shell history.

## 4. Create production secrets

```bash
cd /opt/atlas
cp .env.aws.example .env
chmod 600 .env
nano .env
```

Generate strong values in separate commands and paste them into `.env`:

```bash
openssl rand -hex 24
openssl rand -hex 24
openssl rand -hex 32
```

Use separate generated values for `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and
`JWT_SECRET`. Set `ADMIN_PASSWORD` to another long unique password.

For Gmail OTP:

1. Enable two-step verification on the sending Google account.
2. Create a Google App Password.
3. Put the email in `MAIL_USERNAME` and `MAIL_FROM`.
4. Put the 16-character App Password in `MAIL_APP_PASSWORD`.

No API URL or CORS variable is needed. The frontend and `/api` use the same
public domain through Nginx in both IP-only and HTTPS deployments.

Never commit `.env`.

## 5. Build and start the application

```bash
cd /opt/atlas
docker compose config
COMPOSE_PARALLEL_LIMIT=1 docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=100 backend
```

All three services should become healthy. Test the local container endpoint:

```bash
curl -I http://127.0.0.1:3000
curl http://127.0.0.1:3000/api/products
```

## 6. Configure public Nginx

Edit `deploy/nginx/atlas.conf` and replace both occurrences of the placeholder
domain. If deploying with only an IP initially, use `server_name _;`.

```bash
cd /opt/atlas
nano deploy/nginx/atlas.conf
sudo cp deploy/nginx/atlas.conf /etc/nginx/sites-available/atlas
sudo ln -sfn /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/atlas
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Open `http://YOUR_ELASTIC_IP` or the domain and test registration, login,
products, seller uploads, and OTP email.

## 7. Enable HTTPS

Run this only after the domain points to the Elastic IP:

```bash
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run
```

Certbot updates host Nginx to redirect HTTP to HTTPS and installs automatic
certificate renewal. Confirm that `.env` contains the matching HTTPS origins,
then restart the backend after any environment change:

```bash
cd /opt/atlas
docker compose up -d --force-recreate backend
```

## 8. Deploy future updates

```bash
cd /opt/atlas
git pull --ff-only
COMPOSE_PARALLEL_LIMIT=1 docker compose build
docker compose up -d --remove-orphans
docker image prune -f
docker compose ps
docker compose logs --tail=100 backend
```

The Git repository is not connected to AWS automatically by this setup. Run
these commands when you intentionally want to deploy a pushed commit.

## 9. Back up MySQL

Create a backup directory and database dump:

```bash
cd /opt/atlas
mkdir -p backups
set -a
. ./.env
set +a
docker compose exec -T db mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
  --single-transaction --routines --triggers "$DB_NAME" \
  | gzip > "backups/atlas-$(date +%F-%H%M).sql.gz"
```

Copy backups off the EC2 instance to S3 or another machine. A backup stored only
on the same EBS volume is not sufficient. Also enable scheduled EBS snapshots.

Restore only into the intended database and preferably test restoration on a
separate server first:

```bash
gunzip -c backups/BACKUP_FILE.sql.gz | docker compose exec -T db \
  mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME"
```

## 10. Useful checks

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
df -h
free -h
sudo nginx -t
sudo systemctl status nginx
```

If OTP fails, check backend logs and verify the Gmail App Password, sender
address, SMTP port 587, and outbound network access. Do not print OTP codes or
mail passwords in production logs.
<!-- hi -->
