# Vercel Deployment Guide

## ✅ Configuration Complete

This project is configured for Vercel deployment with:
- `vercel.json` - Vercel configuration file
- Proper `package.json` scripts
- Vite build setup

## 🚀 Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite
6. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally (one-time)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## ⚠️ Troubleshooting

### Permission Denied Error (126)

If you see: `sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied`

**Solution 1: Clear Vercel Cache**

In Vercel dashboard:
1. Go to your project settings
2. Navigate to "Advanced" → "Build & Development Settings"
3. Toggle "Override" for "Build Command"
4. Set to: `npx vite build`
5. Save and redeploy

**Solution 2: Update vercel.json**

If cache clearing doesn't work, try this vercel.json:

```json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist"
}
```

**Solution 3: Force Fresh Install**

In Vercel settings:
1. Go to "Build & Development Settings"
2. Under "Install Command" set: `npm install --no-optional`
3. Deploy again

### Common Issues

**Issue: Build fails with "module not found"**
- Solution: Ensure all dependencies are in `package.json`

**Issue: Blank page after deployment**
- Solution: The SPA rewrites in vercel.json handle this

**Issue: CORS errors with EmulatorJS**
- Solution: EmulatorJS loads from CDN, no server config needed

## 📋 Pre-deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `vercel.json` exists in root
- [ ] `package.json` has correct scripts
- [ ] `.gitignore` excludes `node_modules/` and `dist/`
- [ ] Build works locally: `npm run build`

## 🔧 Current Configuration

**Build Command:** `npm run build` → `vite build`
**Output Directory:** `dist/`
**Framework:** Vite (auto-detected by Vercel)
**SPA Routing:** All routes redirect to `/index.html`

## 🌐 After Deployment

Your app will be available at:
- `https://your-project-name.vercel.app`

You can also:
- Set up a custom domain
- Configure environment variables
- Set up preview deployments for PRs
