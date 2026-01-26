# 🚀 Quick Deploy Guide

## Deploy Your Site in 5 Minutes!

Your Texas Stars fan site is ready to go live 24/7! Here's the fastest way:

### Step 1: Create GitHub Account (if you don't have one)
Go to https://github.com and sign up

### Step 2: Create a New Repository
1. Go to https://github.com/new
2. Repository name: `shining-stars`
3. Make it Public or Private (your choice)
4. **Don't** initialize with README
5. Click "Create repository"

### Step 3: Push Your Code to GitHub

Open Terminal in your project folder and run:

```bash
# Add your GitHub username below
git init
git add .
git commit -m "Initial commit - Texas Stars fan site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shining-stars.git
git push -u origin main
```

### Step 4: Deploy to Vercel (Free!)

1. Go to https://vercel.com
2. Click "Sign Up" and use your GitHub account
3. Click "Add New" → "Project"
4. Select your `shining-stars` repository
5. **IMPORTANT:** Click "Environment Variables" and add these 6 variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyAyZ_qjT6a4DoasrBqA-O6hASA66OhyZQg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = shining-stars-56732.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = shining-stars-56732
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = shining-stars-56732.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 434581683283
NEXT_PUBLIC_FIREBASE_APP_ID = 1:434581683283:web:fad32925a653a5ef29daa6
```

6. Click "Deploy"
7. Wait 2-3 minutes ⏳

### Step 5: Update Firebase Settings

1. Go to https://console.firebase.google.com
2. Select "shining-stars-56732"
3. Go to: Authentication → Settings → Authorized domains
4. Click "Add domain"
5. Add your new Vercel URL (looks like: `shining-stars-abc123.vercel.app`)
6. Save

## 🎉 You're Live!

Your site is now running 24/7 at your Vercel URL!

## Automatic Updates

Every time you want to update your site:

```bash
git add .
git commit -m "Your update description"
git push
```

Vercel will automatically rebuild and deploy in ~2 minutes!

## Your Live URLs

After deployment, you'll have:
- **Main Site:** `https://shining-stars-abc123.vercel.app`
- **Feed:** `https://shining-stars-abc123.vercel.app/feed`
- **Live Chat:** `https://shining-stars-abc123.vercel.app/live-chat`
- **News:** `https://shining-stars-abc123.vercel.app/news`
- **Settings:** `https://shining-stars-abc123.vercel.app/settings`
- **Admin:** `https://shining-stars-abc123.vercel.app/admin`

## Need Help?

See the full DEPLOYMENT.md file for detailed instructions!
