# 🚀 Free Deployment Guide

This project is fully configured for **100% free deployment** using any of the methods below.

---

## ⚡ Option 1: Render.com (Recommended - Single Free Service)

Deploy **both Frontend and Backend together on one free URL** with zero CORS configuration!

### Step 1: Push your code to GitHub
Run these commands in PowerShell in your project folder:
`powershell
git init
git add .
git commit -m Configure project for free cloud deployment
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
`

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com) and sign in with your GitHub account.
2. Click **New +** > **Web Service**.
3. Select your GitHub repository.
4. Configure the following fields:
   - **Name**: student-warning-platform (or any name you choose)
   - **Root Directory**: dashboard/backend
   - **Environment**: Python 3
   - **Build Command**: pip install -r requirements.txt
   - **Start Command**: uvicorn main:app --host 0.0.0.0 --port 
   - **Plan**: Free
5. Click **Create Web Service**.
6. Wait 1–2 minutes. Your live website URL will be ready at:
   https://student-warning-platform.onrender.com

---

## 🌐 Option 2: Vercel (Frontend) + Render (Backend)

For ultra-fast global CDN performance on the frontend:

### Backend (Render.com):
1. Deploy the backend using the same Render steps above.
2. Copy your live Render URL (e.g. https://student-warning-platform.onrender.com).

### Frontend (Vercel.com):
1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New Project** and import your repository.
3. Settings:
   - **Root Directory**: dashboard
   - **Framework Preset**: Vite
4. Expand **Environment Variables**:
   - Key: VITE_API_BASE_URL
   - Value: https://student-warning-platform.onrender.com (your Render URL)
5. Click **Deploy**.

---

## ⚡ Option 3: Instant Live Demo (Zero Cloud Accounts)

To share your running localhost website with anyone over the internet instantly:

1. In Terminal 1 (Backend):
   `powershell
   cd dashboard/backend
   python -m uvicorn main:app --port 8000
   `
2. In Terminal 2 (Frontend):
   `powershell
   cd dashboard
   cmd.exe /c npm run dev
   `
3. In Terminal 3 (Tunnel):
   `powershell
   npx cloudflared tunnel --url http://localhost:5173
   `
   Share the generated https://xxxx.trycloudflare.com link!
