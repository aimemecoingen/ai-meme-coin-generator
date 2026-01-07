# ⚡ QUICK DEPLOY - 5 Minuten!

## 🚀 Snelste Manier: Vercel

### **Stap 1: Maak GitHub Account** (als je die nog niet hebt)
- Ga naar: https://github.com/signup

### **Stap 2: Push Code naar GitHub**

Open **PowerShell** in deze folder en typ:

```powershell
# Initialiseer Git
git init

# Voeg alles toe
git add .

# Commit
git commit -m "AI Meme Coin Generator"

# Ga naar https://github.com/new en maak een repo genaamd: ai-meme-coin-generator

# Vervang YOUR-USERNAME met jouw GitHub username!
git remote add origin https://github.com/YOUR-USERNAME/ai-meme-coin-generator.git
git branch -M main
git push -u origin main
```

### **Stap 3: Deploy op Vercel**

1. **Ga naar**: https://vercel.com/signup
2. **Login met GitHub**
3. **Click "New Project"**
4. **Importeer je repo**: `ai-meme-coin-generator`
5. **Add Environment Variables**:
   
   Click "Environment Variables" en voeg toe:
   
   ```
   OPENAI_API_KEY = sk-proj-jouw-api-key-hier
   JWT_SECRET = maak-dit-een-lange-random-string-12345678
   NODE_ENV = production
   ```

6. **Click "Deploy"**

### **Stap 4: KLAAR! 🎉**

Je site is nu LIVE op: `https://jouw-project.vercel.app`

---

## 🎯 Custom Domain (Optioneel)

Heb je een eigen domain?

1. Ga naar Vercel → Project Settings → Domains
2. Voeg je domain toe
3. Update je DNS records (Vercel geeft je de instructies)

---

## ⚠️ BELANGRIJK!

### OpenAI Credits
Je MOET credits hebben op OpenAI:
1. Ga naar: https://platform.openai.com/usage
2. Voeg $5-10 credits toe
3. Anders werkt de AI niet!

### Environment Variables
**VERGEET NIET** om deze toe te voegen in Vercel:
- `OPENAI_API_KEY` (van OpenAI platform)
- `JWT_SECRET` (maak een random string, bijv: `mijn-super-geheime-key-2024-xyz123`)
- `NODE_ENV` (type: `production`)

---

## 🧪 Test Je Site

Na deployment:
1. Ga naar je Vercel URL
2. Click "Register"
3. Maak een account
4. Genereer een coin
5. Check of alles werkt!

---

## 💡 Tips

- **Gratis Hosting**: Vercel is gratis voor kleine sites
- **Custom Domain**: €10-15/jaar via Namecheap of Google Domains
- **Monitoring**: Check OpenAI usage regelmatig
- **Backup**: Download je `data/` folder regelmatig

---

## 🆘 Probleem?

### Site doet niks / errors
- Check of Environment Variables zijn ingesteld
- Check Vercel logs (Vercel dashboard → Deployments → Click deployment → Logs)

### "AI generation failed"
- Check of OPENAI_API_KEY klopt
- Check of je credits hebt

### "Invalid token" errors  
- Check of JWT_SECRET is ingesteld in Vercel

---

**Veel success met je launch! 🚀🌙**

