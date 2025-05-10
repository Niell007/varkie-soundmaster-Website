/**
 * Deployment script for Soundmaster website
 * Deploys both admin panel and public website to Cloudflare
 */

// src/deploy.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // This is a simple deployment script that would be run via Wrangler
    // In a real implementation, you would use the Cloudflare API to deploy
    
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soundmaster Deployment</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #0055b3;
          }
          pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .success {
            color: #28a745;
          }
          .error {
            color: #dc3545;
          }
        </style>
      </head>
      <body>
        <h1>Soundmaster Deployment</h1>
        
        <div class="card">
          <h2>Admin Panel Deployment</h2>
          <p>To deploy the admin panel to Cloudflare Workers:</p>
          <pre>cd admin
npx wrangler deploy</pre>
        </div>
        
        <div class="card">
          <h2>Public Website Deployment</h2>
          <p>To deploy the public website to Cloudflare Pages:</p>
          <pre>cd public
npx wrangler pages deploy .</pre>
        </div>
        
        <div class="card">
          <h2>Setup Instructions</h2>
          <ol>
            <li>Create a Cloudflare account if you don't have one</li>
            <li>Install Wrangler CLI: <code>npm install -g wrangler</code></li>
            <li>Login to Cloudflare: <code>wrangler login</code></li>
            <li>Create an R2 bucket for media storage: <code>wrangler r2 bucket create soundmaster-media</code></li>
            <li>Create a D1 database: <code>wrangler d1 create soundmaster-db</code></li>
            <li>Update the database ID in wrangler.jsonc</li>
            <li>Create a strong password for the admin panel: <code>wrangler secret put ADMIN_PASSWORD</code></li>
            <li>Deploy the admin panel and public website</li>
          </ol>
        </div>
      </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html"
      }
    });
  }
};
