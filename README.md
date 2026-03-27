# LAZLO OS 🟢

> Ton Personal OS — productivité taillée sur mesure.

---

## 🚀 Déploiement sur Vercel (accès depuis le téléphone, sans ordi)

### Ce dont tu as besoin
- Un compte **GitHub** (gratuit) → github.com
- Un compte **Vercel** (gratuit) → vercel.com
- Une clé **API Anthropic** → console.anthropic.com

---

### ÉTAPE 1 — Mettre le code sur GitHub

1. Va sur **github.com** → clique **"New repository"**
2. Nomme-le `lazlo-os`, laisse tout par défaut → **Create repository**
3. Sur ton ordi, installe **Node.js** (nodejs.org, version LTS) si pas déjà fait
4. Ouvre un terminal dans le dossier `lazlo-os-v2` et tape :

```bash
git init
git add .
git commit -m "LAZLO OS init"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/lazlo-os.git
git push -u origin main
```

---

### ÉTAPE 2 — Déployer sur Vercel

1. Va sur **vercel.com** → connecte-toi avec GitHub
2. Clique **"Add New Project"** → sélectionne `lazlo-os`
3. Framework : Vite (détecté auto) → **Deploy**

---

### ÉTAPE 3 — Ajouter ta clé API Anthropic

1. Va sur **console.anthropic.com** → API Keys → crée une clé
2. Sur Vercel : ton projet → **Settings** → **Environment Variables**
3. Ajoute : Name = `ANTHROPIC_API_KEY` / Value = ta clé
4. **Redeploy** (Deployments → 3 points → Redeploy)

---

### ÉTAPE 4 — Installer sur Android

1. Ouvre ton URL Vercel dans **Chrome** sur Android
2. 3 points → **"Ajouter à l'écran d'accueil"**
3. ✅ App installée, accessible partout, sans ordi

---

*LAZLO OS v2 — La clé API est côté serveur Vercel, jamais exposée.*
# lazlo-os
