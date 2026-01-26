#!/bin/bash

# Shining Stars - Quick Deploy Script
# This script helps you deploy your Texas Stars fan site to run 24/7

echo "🏒⭐ SHINING STARS - DEPLOYMENT HELPER ⭐🏒"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📁 Adding all files to git..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to commit"
else
    echo "💾 Committing changes..."
    echo "Enter commit message (or press Enter for default):"
    read commit_message

    if [ -z "$commit_message" ]; then
        commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi

    git commit -m "$commit_message"
fi

# Check if remote exists
if git remote | grep -q 'origin'; then
    echo "🚀 Pushing to GitHub..."
    git push
    echo ""
    echo "✅ Code pushed to GitHub!"
    echo "📝 Vercel will auto-deploy in ~2 minutes if connected"
else
    echo ""
    echo "⚠️  No GitHub remote found!"
    echo ""
    echo "To set up GitHub:"
    echo "1. Create a new repository at https://github.com/new"
    echo "2. Name it: shining-stars"
    echo "3. Then run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/shining-stars.git"
    echo "   git push -u origin main"
fi

echo ""
echo "📖 For full deployment instructions, see DEPLOYMENT.md"
echo ""
