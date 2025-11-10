# 🔑 Railway PostgreSQL Credentials Guide

## Where to Find Your Credentials

### Step 1: Access Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Login with your account
3. Find your project (should have a PostgreSQL service)

### Step 2: Open PostgreSQL Service

1. Click on the **PostgreSQL** service card
2. You should see the service details

### Step 3: Find the Variables Tab

1. Look for tabs at the top: **Deployments**, **Variables**, **Settings**, etc.
2. Click on **Variables**

## What You'll See

Railway provides PostgreSQL credentials in TWO formats:

### Format 1: Individual Variables (Most Common)

```
PGHOST = tramway.proxy.rlwy.net
PGPORT = 53339
PGUSER = postgres (or could be different!)
PGPASSWORD = YourActualPassword123
PGDATABASE = railway
```

**Important:** The `PGUSER` might NOT be "postgres"! It could be:
- `postgres`
- `railway`
- `root`
- A randomly generated username

### Format 2: Full DATABASE_URL (Less Common)

```
DATABASE_URL = postgresql://postgres:YourPassword123@tramway.proxy.rlwy.net:53339/railway
```

Or:

```
DATABASE_URL = postgres://postgres:YourPassword123@tramway.proxy.rlwy.net:53339/railway
```

## 🎯 What to Copy

### If You Have Format 1 (Individual Variables):

Build the URL manually using this template:
```
postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
```

**Example with your values:**
```
postgresql://postgres:YourPassword123@tramway.proxy.rlwy.net:53339/railway
```

**CRITICAL:** Use the EXACT username from `PGUSER` variable!

### If You Have Format 2 (Full URL):

Just copy the entire `DATABASE_URL` value as-is.

## 🔍 Verify Your Credentials

Before pasting into Render, verify:

1. **Username is correct:** Check `PGUSER` variable
2. **Password has no spaces:** Copy directly, don't type
3. **Host is correct:** Should be `*.railway.app` or `*.proxy.rlwy.net`
4. **Port is correct:** Usually 5432 or a custom port like 53339
5. **Database name:** Usually `railway` or `postgres`

## 📋 Example Scenarios

### Scenario 1: Standard Railway Setup
```
PGUSER = postgres
PGPASSWORD = abc123xyz
PGHOST = containers-us-west-123.railway.app
PGPORT = 5432
PGDATABASE = railway
```

**Your DATABASE_URL:**
```
postgresql://postgres:abc123xyz@containers-us-west-123.railway.app:5432/railway
```

### Scenario 2: Custom Port (Your Case)
```
PGUSER = postgres
PGPASSWORD = your_password_here
PGHOST = tramway.proxy.rlwy.net
PGPORT = 53339
PGDATABASE = railway
```

**Your DATABASE_URL:**
```
postgresql://postgres:your_password_here@tramway.proxy.rlwy.net:53339/railway
```

### Scenario 3: Different Username
```
PGUSER = railway_user
PGPASSWORD = secure_pass_123
PGHOST = tramway.proxy.rlwy.net
PGPORT = 53339
PGDATABASE = railway
```

**Your DATABASE_URL:**
```
postgresql://railway_user:secure_pass_123@tramway.proxy.rlwy.net:53339/railway
```

## ⚠️ Common Mistakes

### Mistake 1: Using "postgres" when username is different
**Wrong:**
```
postgresql://postgres:password@host:port/database
```

**Right:** (if PGUSER = railway_user)
```
postgresql://railway_user:password@host:port/database
```

### Mistake 2: Extra spaces in password
**Wrong:**
```
postgresql://user: password @host:port/database
```

**Right:**
```
postgresql://user:password@host:port/database
```

### Mistake 3: Wrong protocol
**Wrong:**
```
mysql://user:password@host:port/database
```

**Right:**
```
postgresql://user:password@host:port/database
```

## 🧪 Test Your Connection String

Before using in Render, you can test locally:

1. Install `psql` (PostgreSQL client)
2. Run:
   ```bash
   psql postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```

If it connects, your credentials are correct!

## 📝 Checklist

- [ ] Found Railway PostgreSQL service
- [ ] Opened Variables tab
- [ ] Identified PGUSER (might not be "postgres")
- [ ] Copied PGPASSWORD (no spaces)
- [ ] Noted PGHOST and PGPORT
- [ ] Built DATABASE_URL in correct format
- [ ] Verified no typos or extra spaces
- [ ] Ready to paste into Render

## 🚀 Next Step

Once you have the correct `DATABASE_URL`:
1. Go to Render Dashboard
2. Open flexoAPP-backend service
3. Environment → DATABASE_URL
4. Paste your URL
5. Save Changes
6. Wait for redeploy

---

**Remember:** The username in Railway might NOT be "postgres"! Check the `PGUSER` variable carefully! 🔑
