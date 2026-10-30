# Google OAuth to n8n: free test

## 1. Google Cloud (free)
1. console.cloud.google.com -> new project
2. APIs & Services -> Library -> enable **Gmail API** and **Google Drive API**
3. OAuth consent screen -> External -> fill app name + your email -> add scopes
   (gmail.send, drive.file) -> **Test users: add your own Gmail**
4. Credentials -> Create OAuth client ID -> Web application
   Authorized redirect URIs:
     https://YOUR-APP.vercel.app/api/callback
     http://localhost:3000/api/callback   (for `vercel dev`)
5. Copy Client ID + Client secret

## 2. Vercel env vars
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI     = https://YOUR-APP.vercel.app/api/callback
N8N_WEBHOOK_URL         = your n8n webhook (production URL)
N8N_WEBHOOK_SECRET      = any long random string

## 3. n8n
Webhook node (POST) -> IF header x-webhook-secret matches -> save
email + refresh_token to a Google Sheet / data table.

## 4. Deploy
Push this folder to GitHub and import in Vercel (or `vercel` CLI).