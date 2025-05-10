#!/bin/bash
# Deployment script for Soundmaster website to Cloudflare

echo "Soundmaster Cloudflare Deployment"
echo "================================="

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Deploy admin panel
echo -e "\n\033[1mDeploying Admin Panel\033[0m"
cd admin
echo "Installing dependencies..."
npm install

echo "Deploying to Cloudflare Workers..."
wrangler deploy

# Return to root directory
cd ..

# Deploy public website
echo -e "\n\033[1mDeploying Public Website\033[0m"
cd public
echo "Installing dependencies..."
npm install

echo "Deploying to Cloudflare Pages..."
wrangler pages deploy .

echo -e "\n\033[1mDeployment Complete\033[0m"
echo "Your admin panel and public website have been deployed to Cloudflare."
echo "Admin Panel: https://soundmaster-admin.*.workers.dev"
echo "Public Website: https://soundmaster-public.pages.dev"
