# 🚀 Deploy Shining Stars to Run 24/7

This guide will help you deploy your Texas Stars fan site to Vercel so it runs 24/7 on the internet!

## Prerequisites

1. A GitHub account (sign up at https://github.com if you don't have one)
2. A Vercel account (sign up at https://vercel.com with your GitHub account)
3. Your Firebase project is already set up ✅

## Step 1: Push Your Code to GitHub

Open Terminal and run these commands in your project folder:

```bash
# Initialize git repository (if not already done)
git init

# Add all your files
git add .

# Create your first commit
git commit -m "Initial commit - Texas Stars fan site ready for deployment"

# Create a new repository on GitHub.com:
# 1. Go to https://github.com/new
# 2. Name it: shining-stars
# 3. Keep it private or public (your choice)
# 4. Don't initialize with README (you already have one)
# 5. Click "Create repository"

# Then connect and push (replace YOUR_USERNAME with your GitHub username):
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shining-stars.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Easiest)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository (shining-stars)
4. Vercel will auto-detect Next.js settings ✅
5. **IMPORTANT:** Click "Environment Variables" and add these:

```
NEXT_PUBLIC_FIREBASE_API_KEY = (your Firebase API key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = shining-stars-56732.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = shining-stars-56732
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = shining-stars-56732.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (your sender ID)
NEXT_PUBLIC_FIREBASE_APP_ID = (your app ID)
```

6. Click "Deploy"
7. Wait 2-3 minutes ⏳
8. Your site will be live at: `https://shining-stars-xxxx.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Step 3: Configure Your Domain (Optional)

Once deployed, you can:
1. Use the free Vercel domain: `shining-stars.vercel.app`
2. Or add your own custom domain in Vercel settings

## Step 4: Update Firebase Settings

Your app will now have a new URL. Update Firebase:

1. Go to https://console.firebase.google.com
2. Select your project: shining-stars-56732
3. Go to Authentication → Settings → Authorized domains
4. Add your Vercel domain: `shining-stars-xxxx.vercel.app`

## Step 5: Test Your Live Site

Visit your Vercel URL and test:
- ✅ Sign up / Login
- ✅ Create posts on feed
- ✅ Live chat
- ✅ News page with countdown
- ✅ Settings page

## 🎉 You're Live 24/7!

Your site is now running on Vercel's servers and will be available 24/7!

### Automatic Updates

Every time you push to GitHub, Vercel will automatically:
- Build your latest code
- Deploy the update
- Keep your site running with zero downtime

### To Update Your Site:

```bash
# Make changes to your code
# Then:
git add .
git commit -m "Description of your changes"
git push

# Vercel will auto-deploy in ~2 minutes!
```

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Next.js Docs: https://nextjs.org/docs

---

## Environment Variables Reference

Get these from Firebase Console → Project Settings → Your apps:

| Variable | Where to Find |
|----------|---------------|
| NEXT_PUBLIC_FIREBASE_API_KEY | Firebase Console → Config object |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | Firebase Console → Config object |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | Firebase Console → Config object |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | Firebase Console → Config object |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | Firebase Console → Config object |
| NEXT_PUBLIC_FIREBASE_APP_ID | Firebase Console → Config object |
