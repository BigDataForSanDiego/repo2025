# Vercel Deployment Guide

This guide will help you deploy your CareLink SD application to Vercel.

## Prerequisites

1. A GitHub account (recommended) or GitLab/Bitbucket
2. Your code pushed to a Git repository
3. A Vercel account (free at [vercel.com](https://vercel.com))

## Step-by-Step Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Sign in to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Log In"
   - Sign in with your GitHub account (recommended)

3. **Import your project:**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js project

4. **Configure your project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

5. **Set Environment Variables (if needed):**
   - If you're using Google Maps API, add:
     - **Key:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
     - **Value:** Your Google Maps API key
   - Click "Add" for each variable

6. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-3 minutes)
   - Your site will be live at a URL like: `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production deployment, run: `vercel --prod`

## Post-Deployment

### Custom Domain (Optional)
- Go to your project settings in Vercel
- Navigate to "Domains"
- Add your custom domain

### Environment Variables
- If you need to add/update environment variables:
  - Go to Project Settings → Environment Variables
  - Add your variables
  - Redeploy for changes to take effect

### Automatic Deployments
- Every push to your main branch will automatically trigger a new deployment
- Pull requests will get preview deployments automatically

## Important Notes

1. **In-Memory Store:** Your app uses in-memory storage, which means:
   - Data resets on each serverless function restart
   - This is fine for demos, but consider a database for production

2. **Google Maps API:**
   - If you're using Google Maps, make sure to:
     - Add your API key as an environment variable in Vercel
     - Configure allowed domains in Google Cloud Console to include your Vercel domain

3. **Build Time:**
   - First deployment may take 2-3 minutes
   - Subsequent deployments are usually faster

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally: `npm run build`

### API Routes Not Working
- Ensure your API routes are in the `app/api/` directory
- Check Vercel function logs for errors

### Environment Variables Not Working
- Make sure variables starting with `NEXT_PUBLIC_` are set in Vercel
- Redeploy after adding environment variables

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Vercel Support: https://vercel.com/support

