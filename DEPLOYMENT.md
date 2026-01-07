# 🚀 Deployment Guide - AI Meme Coin Generator

## 📋 Pre-Deployment Checklist

- [ ] OpenAI API Key (with credits)
- [ ] GitHub account
- [ ] Vercel account (free)

---

## 🎯 OPTION 1: Deploy to Vercel (RECOMMENDED - Easiest!)

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - AI Meme Coin Generator"
```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Name it: `ai-meme-coin-generator`
   - Don't initialize with README
   - Click "Create repository"

3. **Push your code**:
```bash
git remote add origin https://github.com/YOUR-USERNAME/ai-meme-coin-generator.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Go to Vercel**: https://vercel.com/signup
2. **Sign up** with GitHub
3. **Import your project**:
   - Click "New Project"
   - Import `ai-meme-coin-generator`
4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - `OPENAI_API_KEY` = your-openai-api-key
     - `JWT_SECRET` = any-random-long-string-make-it-secure
     - `NODE_ENV` = production
5. **Deploy!** Click "Deploy"

### Step 3: Done! 🎉

Your site will be live at: `https://your-project.vercel.app`

---

## 🎯 OPTION 2: Deploy to Railway

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `ai-meme-coin-generator`
4. **Add Environment Variables**:
   - Go to "Variables"
   - Add:
     - `OPENAI_API_KEY`
     - `JWT_SECRET`
     - `NODE_ENV` = production
     - `PORT` = 3000
5. **Deploy!**

---

## 🎯 OPTION 3: Deploy to Render

1. **Go to Render**: https://render.com
2. **New Web Service**
3. **Connect GitHub repo**
4. **Settings**:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. **Environment Variables** (same as above)
6. **Deploy!**

---

## ⚙️ Environment Variables Explained

### OPENAI_API_KEY (REQUIRED)
- Your OpenAI API key
- Get it from: https://platform.openai.com/api-keys
- **IMPORTANT**: Add credits! ($5-10 is enough to start)

### JWT_SECRET (REQUIRED)
- Secret key for user authentication
- Make it LONG and RANDOM
- Example: `mY-sUp3R-S3cR3T-k3Y-f0R-pR0dUcT10N-2024`
- **NEVER share this!**

### NODE_ENV
- Set to `production` for live deployment

### PORT
- Usually auto-set by hosting platform
- Default: 3000

---

## 🔒 Security Notes

1. **NEVER commit .env file** to GitHub
2. **Change JWT_SECRET** in production (don't use default)
3. **Monitor OpenAI usage** to avoid unexpected costs
4. **Backup your data/** folder regularly

---

## 📊 Database Notes

Currently using **JSON file storage** (data/ folder)

For PRODUCTION with many users, consider upgrading to:
- **MongoDB** (recommended, free tier available)
- **PostgreSQL** (via Railway/Render)
- **Firebase** (Google, free tier)

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Check environment variables are set correctly
- Check server logs in hosting platform

### "AI generation failed"
- Check OpenAI API key is correct
- Check you have credits: https://platform.openai.com/usage

### "Authentication failed"
- Check JWT_SECRET is set
- Clear browser localStorage and try again

---

## 📱 Custom Domain

### Vercel:
1. Go to Project Settings
2. Domains → Add
3. Enter your domain
4. Follow DNS instructions

### Railway:
1. Settings → Domains
2. Add custom domain
3. Update DNS records

---

## 🎉 Post-Deployment

After deploying:

1. **Test everything**:
   - Register account
   - Create a coin
   - Check dashboard

2. **Monitor costs**:
   - OpenAI: https://platform.openai.com/usage
   - Hosting: Usually free for small traffic

3. **Share your link!** 🚀

---

## 💡 Tips

- **Start small**: Test with a few users first
- **Monitor API costs**: Set up billing alerts on OpenAI
- **Backup data**: Download your data/ folder regularly
- **Upgrade database**: When you have >100 users

---

## 🆘 Need Help?

Common issues:
- **404 errors**: Check vercel.json routes
- **API failures**: Verify OPENAI_API_KEY
- **Login issues**: Check JWT_SECRET is set

---

**Built with ❤️ • Ready to go viral! 🌙🚀**

