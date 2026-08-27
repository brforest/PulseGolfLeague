Deploy frontend changes:
```
cd ~/pulsegolfleague/PulseGolfLeague
rm production_website/pulsegolfleague/dist/index.html
rm production_website/pulsegolfleague/dist/images/athlesign_logo.jpg
rm production_website/pulsegolfleague/dist/images/fairway_hunters_logo.png
rm production_website/pulsegolfleague/node_modules/.package-lock.json
rm api/package-lock.json
git pull
cd production_website/pulsegolfleague
npm install && npm run build
sudo cp -r dist/* /var/www/pulsegolfleague/public
cd ~/pulsegolfleague/PulseGolfLeague/api
npm install --omit=dev
pm2 restart pgl-api
```

# PGL Deployment Guide

## Prerequisites
- DigitalOcean Droplet running Ubuntu (existing)
- Square Developer account (https://developer.squareup.com)
- Resend account (https://resend.com) — free tier is fine
- Domain DNS pointing to your Droplet
- Node.js 18+ and nginx already installed on the Droplet


---

## 1. Square Setup

1. Go to https://developer.squareup.com/apps and create (or open) your app.
2. Under **Credentials**, copy:
   - **Application ID** (starts with `sandbox-sq0idb-` for sandbox, `sq0idp-` for production)
   - **Access Token**
3. Under **Locations**, copy your **Location ID**.
4. When ready for real payments, switch to the **Production** tab to get production credentials.


---

## 2. Resend Setup

1. Sign up at https://resend.com
2. Verify your sending domain (`pulsegolfleague.com`) under **Domains** by adding the DNS records they provide.
3. Under **API Keys**, create a key and copy it.
4. To enable the admin inbox, go to **Inbound**, add a route for your domain (e.g. `info@pulsegolfleague.com`), and add the DNS MX record Resend provides.


---

## 3. Frontend Environment (.env)

In `production_website/pulsegolfleague/`, copy the example and fill it in:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SQUARE_APP_ID=sandbox-sq0idb-YOUR_APP_ID
VITE_SQUARE_LOCATION_ID=YOUR_LOCATION_ID
VITE_SQUARE_ENV=sandbox          # change to "production" when ready
VITE_API_URL=https://pulsegolfleague.com   # your live domain (nginx will proxy /api)
```


---

## 4. Build the Frontend

```bash
cd production_website/pulsegolfleague
npm install
npm run build
```

This produces a `dist/` folder. Copy it to your Droplet (or build directly on the server):

```bash
scp -r dist/ user@YOUR_DROPLET_IP:/var/www/pulsegolfleague/public
```
or on the server:
```bash
cp -r dist/ /var/www/pulsegolfleague/public
```


---

## 5. Server: Clone / Upload the API

On your Droplet, create the app directory and upload the `api/` folder:

```bash
mkdir -p /var/www/pulsegolfleague/api
# From your local machine:
scp -r api/ user@YOUR_DROPLET_IP:/var/www/pulsegolfleague/api
# or from your server:
cp -r api/ /var/www/pulsegolfleague/
```

Or if using git, just pull the repo on the server.


---

## 6. Database: Install Postgres and Create the Schema

Postgres runs on the same Droplet as the API — no separate service needed.

```bash
# Install Postgres
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Create a database user and database
sudo -u postgres psql <<'SQL'
CREATE USER pgl_user WITH PASSWORD 'CHOOSE_A_STRONG_PASSWORD';
CREATE DATABASE pgl OWNER pgl_user;
\q
SQL

# Apply the schema
psql postgresql://pgl_user:CHOOSE_A_STRONG_PASSWORD@localhost:5432/pgl \
  -f /var/www/pulsegolfleague/api/db/schema.sql
```

You should see `CREATE TABLE` and `CREATE INDEX` printed. Run this only once.

Postgres starts automatically on boot. To verify:
```bash
sudo systemctl status postgresql
```


---

## 7. API Environment (.env)

On the Droplet:

```bash
cd /var/www/pulsegolfleague/api
cp .env.example .env
nano .env   # or use vim, etc.
```

Fill in every value:

```
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://pgl_user:CHOOSE_A_STRONG_PASSWORD@localhost:5432/pgl

SQUARE_ENV=sandbox              # change to "production" when ready
SQUARE_ACCESS_TOKEN=YOUR_SQUARE_ACCESS_TOKEN

RESEND_API_KEY=re_YOUR_RESEND_KEY
EMAIL_FROM=PGL <noreply@pulsegolfleague.com>

FRONTEND_URL=https://pulsegolfleague.com,https://www.pulsegolfleague.com

CHARGE_DATE=2026-08-25

# Required to receive inbound emails in the admin inbox.
# Generate any random string: openssl rand -hex 32
# Then set the Resend inbound webhook URL to:
#   https://pulsegolfleague.com/api/webhooks/email-inbound?token=YOUR_SECRET
WEBHOOK_SECRET=YOUR_RANDOM_SECRET
```

Save and close.


---

## 8. Install API Dependencies

```bash
cd /var/www/pulsegolfleague/api
npm install --omit=dev
```


---

## 9. Start the API with PM2

```bash
# Install PM2 globally if not already installed
npm install -g pm2

cd /var/www/pulsegolfleague/api

# Create the logs directory
mkdir -p logs

# Start the app
pm2 start ecosystem.config.cjs

# Save the process list so it restarts after a reboot
pm2 save

# Generate and run the startup command (copy/paste the command it prints)
pm2 startup
```

Verify it's running:
```bash
pm2 status
pm2 logs pgl-api --lines 30
```


---

## 10. nginx Configuration

Add a new server block (or update your existing one) for your domain.
File location is typically `/etc/nginx/sites-available/pulsegolfleague.com`:

```nginx
server {
    listen 80;
    server_name pulsegolfleague.com www.pulsegolfleague.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name pulsegolfleague.com www.pulsegolfleague.com;

    # SSL — use certbot/Let's Encrypt if not already set up:
    # sudo certbot --nginx -d pulsegolfleague.com -d www.pulsegolfleague.com
    ssl_certificate     /etc/letsencrypt/live/pulsegolfleague.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pulsegolfleague.com/privkey.pem;

    # Serve the built frontend
    root /var/www/pulsegolfleague/public;
    index index.html;

    # SPA fallback — lets React handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api requests to the Node API
    location /api {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/pulsegolfleague.com \
           /etc/nginx/sites-enabled/pulsegolfleague.com

sudo nginx -t          # check for syntax errors
sudo systemctl reload nginx
```


---

## 11. Verify Everything Works

```bash
# Health check
curl https://pulsegolfleague.com/api/health
# Should return: {"status":"ok","ts":"..."}

# PM2 logs — watch for errors
pm2 logs pgl-api
```

Open the site in a browser and complete a test registration using Square sandbox card:
- Card number: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits
- Zip: any 5 digits

Check the database to confirm the row was inserted:
```bash
psql $DATABASE_URL -c "SELECT first_name, last_name, email, charge_status FROM registrations;"
```

Check your email for the confirmation message.


---

## 12. Going Live (Production)

When you're ready to accept real payments:

**Frontend** (`production_website/pulsegolfleague/.env`):
```
VITE_SQUARE_APP_ID=sq0idp-YOUR_PRODUCTION_APP_ID
VITE_SQUARE_LOCATION_ID=YOUR_PRODUCTION_LOCATION_ID
VITE_SQUARE_ENV=production
```
Rebuild and redeploy the frontend (`npm run build`, copy `dist/`).

**API** (`/var/www/pulsegolfleague/api/.env`):
```
SQUARE_ENV=production
SQUARE_ACCESS_TOKEN=YOUR_PRODUCTION_ACCESS_TOKEN
```
Restart the API:
```bash
pm2 restart pgl-api
```


---

## 13. Ongoing: Monitoring Charges

The charge job runs automatically every day at 9:00 AM Pacific.
On August 25, 2026 it will charge all pending registrations.

To check the status of all registrations at any time:
```bash
psql $DATABASE_URL -c \
  "SELECT first_name, last_name, email, charge_status, charged_at, charge_error
   FROM registrations ORDER BY registered_at;"
```

To view the charge job logs:
```bash
pm2 logs pgl-api | grep charge-job
```

To apply a schema change (new/updated tables) after a `git pull`, run the schema
file again from the repo (it's safe — uses `CREATE TABLE IF NOT EXISTS`):
```bash
cd ~/pulsegolfleague/PulseGolfLeague/api
export $(grep DATABASE_URL .env | xargs)
psql "$DATABASE_URL" -f db/schema.sql
```

To manually trigger the charge job (e.g. for testing):
```bash
cd /var/www/pulsegolfleague/api
node -e "import('./jobs/chargeRegistrations.js').then(m => m.runChargeJob())"
```


---

## Troubleshooting

| Symptom | Check |
|---|---|
| `/api/health` returns 502 | `pm2 status` — is pgl-api running? Check `pm2 logs pgl-api` |
| Registration fails with DB error | Confirm `DATABASE_URL` is correct and schema was applied |
| Square tokenization fails | Verify `VITE_SQUARE_APP_ID` and `VITE_SQUARE_ENV` match your Square Dashboard |
| Confirmation email not received | Check spam; verify Resend domain is verified; check `pm2 logs` for email errors |
| Charge job didn't run | Check server timezone; view logs with `pm2 logs pgl-api \| grep charge-job` |
