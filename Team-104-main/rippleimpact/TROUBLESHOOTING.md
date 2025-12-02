# 🔧 GitHub Pages Troubleshooting

## Current Issue: 404 Error on main.jsx

If you're seeing a 404 error for `main.jsx` or other assets, follow these steps:

---

## Step 1: Verify GitHub Pages Settings ✅

1. Go to: `https://github.com/chinmaybi/temp-hackathon/settings/pages`
2. Under **"Build and deployment"**:
   - **Source** should be: **GitHub Actions** (NOT "Deploy from a branch")
   - If it shows "Deploy from a branch", change it to "GitHub Actions"
3. Save if you made changes

---

## Step 2: Check GitHub Actions Status 🔍

1. Go to: `https://github.com/chinmaybi/temp-hackathon/actions`
2. Look for the latest workflow run called "Deploy to GitHub Pages"
3. **Check the status**:
   - ✅ **Green checkmark** = Deployment successful
   - ❌ **Red X** = Deployment failed
   - 🟡 **Yellow dot** = Still running (wait for it to finish)

### If the workflow failed:

- Click on the failed workflow
- Look for error messages
- Common issues:
  - Node version mismatch
  - Missing dependencies
  - Build errors

### If there's no workflow at all:

The `.github/workflows/deploy.yml` file might not have been pushed. Run:

```bash
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact
git push
```

---

## Step 3: Clear Browser Cache 🔄

Even if the site is deployed, your browser might be showing an old cached version:

### Hard Refresh:

- **Chrome/Edge (Mac)**: `Cmd + Shift + R`
- **Chrome/Edge (Windows)**: `Ctrl + Shift + R`
- **Firefox (Mac)**: `Cmd + Shift + R`
- **Firefox (Windows)**: `Ctrl + F5`
- **Safari**: `Cmd + Option + R`

### Or Clear Cache Manually:

1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

---

## Step 4: Test Locally First 🏠

Build and preview the site locally to ensure it works:

```bash
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact

# Build the project
npm run build

# Preview the built version
npm run preview
```

Then visit: `http://localhost:4173/temp-hackathon/`

If it works locally but not on GitHub Pages, the issue is with GitHub deployment.

---

## Step 5: Push Latest Changes 📤

Make sure all the latest changes are pushed:

```bash
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact

# Check what's not pushed
git status

# If there are unpushed commits:
git push

# If you need to set the remote:
git remote add origin https://github.com/chinmaybi/temp-hackathon.git
git push -u origin main
```

---

## Step 6: Trigger a Fresh Deployment 🚀

Force GitHub to rebuild everything:

```bash
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact

# Make a small change to trigger rebuild
echo "" >> README.md

# Commit and push
git add .
git commit -m "Trigger fresh deployment"
git push
```

Then wait 3-5 minutes and check the Actions tab again.

---

## Common Issues & Solutions 🛠️

### Issue: "Failed to load resource: 404"

**Cause**: Base path mismatch or old cache

**Solution**:

1. Verify `vite.config.js` has: `base: '/temp-hackathon/'`
2. Hard refresh browser
3. Check GitHub Actions completed successfully
4. Wait 5 minutes for CDN cache to clear

### Issue: Blank page, no errors

**Cause**: JavaScript not loading or routing issue

**Solution**:

1. Open browser console (F12)
2. Look for specific errors
3. Check Network tab to see which files are 404ing
4. Verify the base path in `vite.config.js` matches your repo name exactly

### Issue: "Deploy from a branch" selected but no gh-pages branch

**Cause**: Wrong GitHub Pages source

**Solution**:

1. Go to Settings → Pages
2. Change Source to **"GitHub Actions"**
3. Push a commit to trigger the workflow

### Issue: Workflow never runs

**Cause**: Workflow file not in repository

**Solution**:

```bash
# Check if workflow file exists
ls -la .github/workflows/deploy.yml

# If missing, it wasn't committed
git add .github/workflows/deploy.yml
git commit -m "Add deployment workflow"
git push
```

---

## Verification Checklist ✓

Before asking for help, verify:

- [ ] Repository name is: `temp-hackathon`
- [ ] `vite.config.js` has: `base: '/temp-hackathon/'`
- [ ] GitHub Pages source is set to: **GitHub Actions**
- [ ] Latest workflow run shows: ✅ Success
- [ ] Waited at least 5 minutes after successful deployment
- [ ] Hard refreshed browser (Cmd+Shift+R / Ctrl+Shift+R)
- [ ] Checked browser console for specific errors
- [ ] Tested locally with `npm run preview`

---

## Expected URLs 🌐

After successful deployment:

- **Live Site**: `https://chinmaybi.github.io/temp-hackathon/`
- **GitHub Repo**: `https://github.com/chinmaybi/temp-hackathon`
- **Actions**: `https://github.com/chinmaybi/temp-hackathon/actions`
- **Settings**: `https://github.com/chinmaybi/temp-hackathon/settings/pages`

---

## Still Not Working? 🆘

If you've tried everything above:

1. **Check the Actions log**:

   - Go to Actions tab
   - Click on the latest workflow run
   - Click on "build" and "deploy" jobs
   - Look for red error messages

2. **Verify the build output**:

   ```bash
   cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact
   npm run build
   cat dist/index.html
   ```

   Check that paths start with `/temp-hackathon/`

3. **Try a clean rebuild**:
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   git add .
   git commit -m "Clean rebuild"
   git push
   ```

---

## Quick Diagnostic Command 🔍

Run this to check your setup:

```bash
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact
echo "=== Git Status ==="
git status
echo ""
echo "=== Git Remote ==="
git remote -v
echo ""
echo "=== Vite Config ==="
cat vite.config.js | grep base
echo ""
echo "=== Recent Commits ==="
git log --oneline -3
```

Share the output if you need help debugging!

---

## Success Indicators ✨

You'll know it's working when:

1. ✅ GitHub Actions shows green checkmark
2. ✅ Browser loads the landing page at `https://chinmaybi.github.io/temp-hackathon/`
3. ✅ No 404 errors in browser console
4. ✅ Can navigate between pages
5. ✅ All styles and images load correctly

**Estimated deployment time**: 2-5 minutes after pushing

Good luck! 🚀
