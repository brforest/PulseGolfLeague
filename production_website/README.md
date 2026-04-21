# Pulse Golf League Production Website

This folder contains the production Vite + React website.

## App Location

The web app lives in:

`production_website/pulsegolfleague`

## Run Locally

1. Open a terminal in the app folder:

```bash
cd production_website/pulsegolfleague
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the local URL shown in terminal (usually `http://localhost:5173` or next available port).

## Create Production Build

From `production_website/pulsegolfleague`:

```bash
npm run build
```

This outputs static files in `production_website/pulsegolfleague/dist`.

## First-Time Production Deploy (DigitalOcean + Squarespace Domain)

### 1) Prepare server

SSH into the droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Install Nginx and Certbot:

```bash
apt update
apt install -y nginx certbot python3-certbot-nginx
```

Create web root:

```bash
mkdir -p /var/www/pulsegolfleague
```

### 2) Upload built site

Run locally (from `production_website/pulsegolfleague` after `npm run build`):

```bash
scp -r dist/* root@YOUR_DROPLET_IP:/var/www/pulsegolfleague/
```

scp -r dist/* root@pulsegolfleague.com:/var/www/pulsegolfleague/

### 3) Configure Nginx

On droplet, create config:

```bash
nano /etc/nginx/sites-available/pulsegolfleague
```

Paste:

```nginx
server {
	listen 80;
	server_name yourdomain.com www.yourdomain.com;

	root /var/www/pulsegolfleague;
	index index.html;

	location / {
		try_files $uri $uri/ /index.html;
	}

	location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$ {
		expires 30d;
		add_header Cache-Control "public, immutable";
	}
}
```

Enable and reload:

```bash
ln -s /etc/nginx/sites-available/pulsegolfleague /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 4) Point domain from Squarespace

In Squarespace Domains DNS:

1. Add/Update `A` record: host `@` -> `YOUR_DROPLET_IP`
2. Add/Update `CNAME` record: host `www` -> `yourdomain.com`

Remove conflicting records for `@` and `www` if present.

### 5) Enable HTTPS

After DNS propagates:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Updating Production (Subsequent Deploys)

For each new release:

1. Build locally:

```bash
cd production_website/pulsegolfleague
npm install
npm run build
```

2. Upload the new build:

```bash
scp -r dist/* root@YOUR_DROPLET_IP:/var/www/pulsegolfleague/
```

3. (Optional) If Nginx config changed, reload:

```bash
ssh root@YOUR_DROPLET_IP
nginx -t && systemctl reload nginx
```

## Quick Troubleshooting

- Blank page after deploy: confirm `dist` was copied and `try_files` exists in Nginx config.
- Domain not resolving: verify Squarespace DNS records and wait for propagation.
- SSL failed: run Certbot again after DNS is fully propagated.
