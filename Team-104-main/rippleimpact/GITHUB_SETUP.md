# 🚀 Push to GitHub - Step by Step

Your code is ready to push! Follow these simple steps:

## Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: **rippleimpact** (or choose your own name)
3. Description: _"A donation platform connecting donors with homeless individuals - proof of concept"_
4. Choose: **Public** (required for free GitHub Pages)
5. **DO NOT** check "Initialize this repository with a README"
6. Click **"Create repository"**

## Step 2: Push Your Code

GitHub will show you commands. Use these instead (already configured):

```bash
# Navigate to your project (if not already there)
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact

# Add your GitHub repo as remote (REPLACE with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/rippleimpact.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

For example, if your username is `johndoe`:

```bash
git remote add origin https://github.com/johndoe/rippleimpact.git
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab (top right)
3. Scroll to **"Pages"** in the left sidebar
4. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"**
5. That's it! The workflow will run automatically

## Step 4: Watch It Deploy

1. Go to the **"Actions"** tab in your repo
2. You'll see "Deploy to GitHub Pages" workflow running
3. Click on it to watch progress
4. Wait 2-3 minutes for completion
5. Green checkmark = Success! ✅

## Step 5: View Your Live Site

Your site will be live at:

```
https://YOUR_USERNAME.github.io/rippleimpact/
```

Example:

- Username: `johndoe`
- Live URL: `https://johndoe.github.io/rippleimpact/`

---

## 🎯 Quick Copy-Paste Commands

After creating your GitHub repo, run these (update YOUR_USERNAME):

```bash
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact
git remote add origin https://github.com/YOUR_USERNAME/rippleimpact.git
git push -u origin main
```

---

## ⚠️ Important: Update Base Path (If Needed)

If you named your repo something OTHER than "rippleimpact":

1. Open `vite.config.js`
2. Change this line:
   ```javascript
   base: '/rippleimpact/',
   ```
   To match your repo name:
   ```javascript
   base: '/YOUR-REPO-NAME/',
   ```
3. Commit and push again:
   ```bash
   git add vite.config.js
   git commit -m "Update base path"
   git push
   ```

---

## 🔄 Making Updates Later

Whenever you make changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

The site will automatically rebuild and deploy! 🎉

---

## 🆘 Troubleshooting

### "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/rippleimpact.git
```

### "Permission denied"

You may need to authenticate:

- Use a Personal Access Token instead of password
- Or set up SSH keys
- GitHub will guide you through this

### Deployment fails

- Check Actions tab for error messages
- Make sure `package-lock.json` is committed
- Verify Node version in workflow (should be 20)

---

## ✅ Checklist

- [ ] Created GitHub repository
- [ ] Copied the correct remote URL
- [ ] Ran `git remote add origin ...`
- [ ] Ran `git push -u origin main`
- [ ] Enabled GitHub Pages (Source: GitHub Actions)
- [ ] Watched workflow complete in Actions tab
- [ ] Visited live URL
- [ ] Tested all pages work
- [ ] Shared the link! 🚀

---

## 📱 Share Your Success!

Once live, share:

- **Live Demo**: Your GitHub Pages URL
- **Source Code**: Your GitHub repo URL
- **Screenshots**: Take some for your portfolio!

Perfect for hackathons, portfolios, and demos! 🌟
