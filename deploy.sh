#!/bin/bash

# GitHub Pages Deployment Script for ClaudioVeloso
# This script builds and commits the project for GitHub Pages deployment

echo "🚀 Starting GitHub Pages deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: This is not a git repository"
    exit 1
fi

# Build the project
echo "📦 Building the project..."
cd job-offer-app
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Go back to root
cd ..

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

if [ $? -ne 0 ]; then
    echo "ℹ️  No changes to commit or commit failed"
fi

# Push to main branch
echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Your site will be available at: https://mrtfb.github.io/ClaudioVeloso"
    echo "⏱️  GitHub Pages deployment usually takes 1-5 minutes"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

echo "🎉 Deployment process completed!"
