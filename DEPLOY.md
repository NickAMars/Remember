# Deploying Remember for free

One free **Render** web service runs the API and serves the built React app from the same URL.
The database is a free **Neon** Postgres. Both have no monthly cost.

## What "free" means here

| | Render (app) | Neon (database) |
|---|---|---|
| Sleeps | After 15 min with no visitors. The next visit waits about 1 minute while it wakes. | After 5 min idle. Wakes in under a second on the next query. |
| Monthly allowance | 750 instance hours (enough for one app running all month) | 100 compute hours, 5 GB transfer |
| Storage | none needed | 1 GB |
| Expires? | No | No |

Don't use Render's own free Postgres: it is deleted 30 days after you create it.

## Step 1. Create the database on Neon

1. Sign up at https://neon.com (GitHub sign-in works, no card needed).
2. Create a project. Pick the region closest to where you'll run Render (for example **AWS US East 2 (Ohio)** if you'll pick Render's **Ohio** region, or **US West 2 (Oregon)** for Render's **Oregon**).
3. On the project dashboard click **Connect**. Turn **Connection pooling off** (the app keeps its own small pool, and migrations run more safely on a direct connection).
4. Copy the connection string. It looks like
   `postgresql://neondb_owner:xxxx@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
5. Change the end to `?sslmode=verify-full`, so you have
   `postgresql://neondb_owner:xxxx@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`

You don't need to create tables. The app runs its migrations every time it starts.

## Step 2. Push the deploy files to GitHub

Render deploys from GitHub, so `render.yaml` and the server changes need to be on the branch Render builds (`master`).

## Step 3. Create the app on Render

1. Sign up at https://render.com with GitHub.
2. Click **New > Blueprint**, pick the `Remember` repository, and Render reads `render.yaml`.
3. When it asks for `DATABASE_URL`, paste the Neon string from step 1. Everything else is filled in (Render makes a random `JWT_SECRET` for you).
4. Click **Apply**. The first build takes a few minutes. When it finishes, open `https://remember-xxxx.onrender.com`.
5. Check `https://<your-app>.onrender.com/healthz` returns `{"status":"ok"}`.

If you'd rather not use a Blueprint, make a **New > Web Service** with:
- Build command: `npm run deploy:build`
- Start command: `npm start`
- Instance type: Free
- Health check path: `/healthz`
- Environment: `NODE_ENV=production`, `NODE_VERSION=22`, `DATABASE_URL=<neon string>`, `JWT_SECRET=<openssl rand -hex 32>`, `TRUST_PROXY_HOPS=1`, `DATABASE_POOL_MAX=5`

## Environment variables

| Name | Needed | What it does |
|---|---|---|
| `DATABASE_URL` | yes | Neon connection string |
| `JWT_SECRET` | yes | At least 32 random characters; sign-ins break if it changes |
| `NODE_ENV` | yes | `production` turns on SSL, security headers and serving the React app |
| `DATABASE_SSL` | no | `true` by default in production |
| `DATABASE_POOL_MAX` | no | Max open database connections (default 10, use 5 on free plans) |
| `TRUST_PROXY_HOPS` | no | `1` on Render, so rate limits see each visitor's real IP |
| `JWT_TTL` | no | How long a sign-in lasts (default `30d`) |
| `PORT` | no | Render sets this itself |

## Tips

- **First visit is slow.** That's Render waking the app. A free uptime pinger (e.g. UptimeRobot hitting `/healthz` every 10 minutes) keeps it awake, but uses your 750 hours faster and keeps Neon awake too. For a personal study app, letting it sleep is fine.
- **Logs:** Render dashboard > your service > Logs. A good start prints `Database connected.` then `Remember API on ...`.
- **Backups:** Neon's free plan keeps a short history you can restore from. For your own copy, run `pg_dump "<neon url>" > backup.sql` now and then.
