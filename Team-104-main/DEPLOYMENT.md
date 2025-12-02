# 🚀 Deploy RippleImpact to GitHub Pages

## Quick Deployment Guide

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: **rippleimpact** (or any name you prefer)
4. Choose "Public" (required for free GitHub Pages)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Push Your Code to GitHub

```bash
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact

# Add all files
git add .

# Commit
git commit -m "Initial commit: RippleImpact donation platform"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rippleimpact.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under "Build and deployment":
   - Source: Select **GitHub Actions**
5. The GitHub Action will automatically deploy when you push code!

### Step 4: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You'll see a workflow running
3. Wait for it to complete (usually 2-3 minutes)
4. Once complete, your site will be live!

### Step 5: Access Your Live Site

Your site will be available at:

```
https://YOUR_USERNAME.github.io/rippleimpact/
```

For example, if your GitHub username is `john-doe`:

```
https://john-doe.github.io/rippleimpact/
```

---

## 🔧 Alternative: Manual Deployment (Without GitHub Actions)

If you prefer manual deployment:

### Build the project locally:

```bash
npm run build
```

### Deploy using gh-pages package:

```bash
# Install gh-pages
npm install -D gh-pages

# Add deploy script to package.json (already done for you)
# Then run:
npm run deploy
```

The manual deploy script will:

1. Build your project
2. Push the `dist` folder to a `gh-pages` branch
3. GitHub will automatically serve it

---

## 📝 Important Notes

### Base Path Configuration

The `vite.config.js` is already configured with:

```javascript
base: "/rippleimpact/";
```

⚠️ **If you named your repository differently**, update this to match your repo name!

For example, if your repo is named `my-donation-app`:

```javascript
base: "/my-donation-app/";
```

### Custom Domain (Optional)

Want to use your own domain like `rippleimpact.com`?

1. Add a `CNAME` file to the `public` folder:

   ```bash
   echo "rippleimpact.com" > public/CNAME
   ```

2. In GitHub Settings → Pages → Custom domain:

   - Enter your domain
   - Enable "Enforce HTTPS"

3. Configure your domain's DNS:
   - Add a CNAME record pointing to `YOUR_USERNAME.github.io`

---

## 🔄 Updating Your Live Site

Every time you want to update the live site:

```bash
# Make your changes, then:
git add .
git commit -m "Update: description of changes"
git push
```

The GitHub Action will automatically rebuild and redeploy! 🎉

---

## 🐛 Troubleshooting

### Site shows 404

- Make sure GitHub Pages is enabled in Settings → Pages
- Check that the `base` path in `vite.config.js` matches your repo name
- Wait a few minutes after pushing (deployment takes time)

### Styles not loading

- Verify the `base` path is correct in `vite.config.js`
- Clear your browser cache (Cmd+Shift+R / Ctrl+Shift+R)

### GitHub Action fails

- Check the Actions tab for error details
- Make sure Node.js 20 is specified in the workflow
- Verify `package-lock.json` is committed

### Routes not working (404 on refresh)

This is normal for client-side routing on GitHub Pages. Solutions:

1. Use hash routing (add `#` to URLs)
2. Or add a custom 404.html that redirects to index.html

---

## 📦 Add Deploy Script to package.json

I've prepared a manual deploy option. Add this to your `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "npm run build && gh-pages -d dist"
}
```

Then you can deploy anytime with:

```bash
npm run deploy
```

---

## ✅ Deployment Checklist

- [ ] Created GitHub repository
- [ ] Pushed code to GitHub (`git push`)
- [ ] Enabled GitHub Pages in Settings
- [ ] Selected "GitHub Actions" as source
- [ ] Waited for Actions workflow to complete
- [ ] Visited your live URL
- [ ] Tested all pages and navigation
- [ ] Verified mobile responsiveness
- [ ] Shared the link! 🎉

---

## 🌟 Your Live Demo

Once deployed, you can share:

- **Demo Link**: `https://YOUR_USERNAME.github.io/rippleimpact/`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/rippleimpact`

Perfect for:

- Portfolio showcases
- Hackathon submissions
- Investor presentations
- User testing
- Client demos

---

**Need help?** Check the GitHub Actions logs or create an issue in your repository!
