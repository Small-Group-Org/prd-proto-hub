# Vercel Deployment Guide for PRD-PROTO-HUB

This guide walks you through deploying your Next.js application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
2. **GitHub/GitLab/Bitbucket Account**: Your code should be in a Git repository
3. **PostgreSQL Database**: You'll need a database (Vercel Postgres, Supabase, or any PostgreSQL provider)

---

## Step 1: Prepare Your Repository

1. **Commit all changes** to your Git repository:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify your build works locally**:
   ```bash
   npm run build
   ```

---

## Step 2: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Create a new Postgres database
4. Note the connection string (you'll use this as `DATABASE_URL`)

### Option B: External PostgreSQL (Supabase, Railway, etc.)

1. Set up your PostgreSQL database with your preferred provider
2. Get the connection string (format: `postgresql://user:password@host:port/database?sslmode=require`)

---

## Step 3: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended for first-time)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your Git repository**:
   - Connect your GitHub/GitLab/Bitbucket account if not already connected
   - Select your `prd-proto-hub` repository
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Click "Deploy"** (we'll add environment variables after)

### Method 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your scope (personal/team)
   - Link to existing project or create new

---

## Step 4: Configure Environment Variables

After your first deployment, configure these environment variables in Vercel:

### Navigate to Environment Variables

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables

#### Database
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```
- Use your PostgreSQL connection string
- For Vercel Postgres: Found in Storage → Your Database → `.env.local`

#### Application URL
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```
- Replace with your actual Vercel deployment URL
- Update this after you know your production URL

#### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
```
- Generate a strong random secret (use `openssl rand -base64 32` or similar)
- Keep this secret secure and never commit it to Git

#### SAML Configuration
```
SAML_ENTRY_POINT=https://sso.smallgroup.com/saml/login
SAML_ISSUER=prd-proto-hub
SAML_CALLBACK_URL=https://your-app-name.vercel.app/api/auth/saml/callback
SAML_IDP_CERT=-----BEGIN CERTIFICATE-----\n...your-certificate...\n-----END CERTIFICATE-----
```

**SAML Certificate Notes**:
- Get the X.509 certificate from your IdP (Identity Provider)
- For multi-line certificates, use `\n` for newlines or paste the entire certificate
- If your IdP requires signed requests, also add:
  ```
  SAML_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...your-private-key...\n-----END PRIVATE KEY-----
  SAML_DECRYPTION_PVK=-----BEGIN PRIVATE KEY-----\n...decryption-key...\n-----END PRIVATE KEY-----
  ```

#### Optional Environment Variables
```
NEXT_PUBLIC_API_URL=/api
```
- Usually not needed (defaults to `/api`)

### Environment Variable Settings

For each variable, set:
- **Environment**: Select all (Production, Preview, Development)
- Or set different values for each environment if needed

---

## Step 5: Run Database Migrations

After setting up your database and environment variables:

### Option 1: Using Vercel CLI (Recommended)

1. **Install Prisma globally** (if not already):
   ```bash
   npm install -g prisma
   ```

2. **Run migrations**:
   ```bash
   # Set your DATABASE_URL temporarily
   export DATABASE_URL="your-database-url"
   
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   ```

### Option 2: Using Vercel Build Command

Add a postinstall script to run migrations automatically:

1. **Update `package.json`**:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate",
       "vercel-build": "prisma generate && prisma migrate deploy && next build"
     }
   }
   ```

2. **Update Vercel Build Command**:
   - Go to **Settings** → **General** → **Build & Development Settings**
   - Set **Build Command** to: `npm run vercel-build`

### Option 3: Manual Migration via Vercel CLI

```bash
# Connect to your database and run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Step 6: Update SAML Callback URL

1. **Get your production URL** from Vercel (e.g., `https://prd-proto-hub.vercel.app`)
2. **Update `SAML_CALLBACK_URL`** in Vercel environment variables:
   ```
   SAML_CALLBACK_URL=https://prd-proto-hub.vercel.app/api/auth/saml/callback
   ```
3. **Update your IdP configuration**:
   - Log into your SAML Identity Provider (Small Group SSO)
   - Update the Assertion Consumer Service (ACS) URL to match your Vercel URL
   - Update the callback URL in your IdP settings

---

## Step 7: Redeploy

After setting environment variables:

1. **Trigger a new deployment**:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger automatic deployment

---

## Step 8: Verify Deployment

1. **Check build logs**:
   - Go to **Deployments** → Click on deployment → View **Build Logs**
   - Ensure build completed successfully

2. **Test the application**:
   - Visit your Vercel URL
   - Test login flow
   - Verify database connections

3. **Check function logs**:
   - Go to **Functions** tab to see API route logs
   - Monitor for any errors

---

## Step 9: Create Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` and `SAML_CALLBACK_URL` with your custom domain

---

## Step 10: Set Up Production Database (If using Vercel Postgres)

1. **Create production database**:
   - Go to **Storage** → Create new Postgres database
   - Use this for production environment

2. **Update `DATABASE_URL`**:
   - Set production environment variable to production database URL

---

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - Missing environment variables
   - Prisma client not generated (add `prisma generate` to build command)
   - TypeScript errors (fix locally first)

### Database Connection Issues

1. **Verify `DATABASE_URL`** is correct
2. **Check SSL mode**: Use `?sslmode=require` in connection string
3. **Verify database is accessible** from Vercel's IP ranges
4. **Check firewall rules** if using external database

### SAML Authentication Fails

1. **Verify callback URL** matches exactly in IdP and Vercel
2. **Check SAML certificate** format (proper newlines)
3. **Verify `SAML_ISSUER`** matches IdP configuration
4. **Check function logs** for SAML errors

### Prisma Client Errors

1. **Ensure `prisma generate` runs** in build process
2. **Add to `package.json`**:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate"
     }
   }
   ```

---

## Vercel Configuration File (Optional)

Create `vercel.json` in project root for advanced configuration:

```json
{
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "PRISMA_GENERATE_DATAPROXY": "true"
  }
}
```

---

## Environment-Specific Settings

### Production
- Use production database
- Use production SAML endpoints
- Use production app URL

### Preview (Pull Requests)
- Can use staging database
- Can use staging SAML endpoints
- Auto-generated preview URLs

### Development
- Use local development database
- Use local SAML endpoints
- Use localhost URLs

---

## Security Checklist

- [ ] Strong `JWT_SECRET` (32+ characters, random)
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] SAML certificates stored securely in environment variables
- [ ] No secrets committed to Git
- [ ] Environment variables set for all environments
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Database credentials rotated regularly

---

## Monitoring & Logs

1. **Function Logs**: **Functions** tab in Vercel dashboard
2. **Build Logs**: **Deployments** → Click deployment → **Build Logs**
3. **Analytics**: Enable in **Analytics** tab (may require Pro plan)
4. **Error Tracking**: Consider integrating Sentry or similar

---

## Next Steps

1. Set up **automatic deployments** from main branch
2. Configure **preview deployments** for pull requests
3. Set up **monitoring and alerts**
4. Configure **backup strategy** for database
5. Set up **CI/CD** for running tests before deployment

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Prisma on Vercel**: [prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

## Quick Reference: Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# SAML
SAML_ENTRY_POINT=https://sso.smallgroup.com/saml/login
SAML_ISSUER=prd-proto-hub
SAML_CALLBACK_URL=https://your-app.vercel.app/api/auth/saml/callback
SAML_IDP_CERT=-----BEGIN CERTIFICATE-----...
```

---

**Last Updated**: 2024
**Project**: PRD-PROTO-HUB

