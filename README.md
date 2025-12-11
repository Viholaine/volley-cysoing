# 🏐 Volleyball Cysoing Project

Projet complet de scraping et visualisation de scores de volley-ball avec architecture serverless sur Vercel et base de données Supabase.

## 🏗️ Architecture

```
volley-cysoing/
├── frontend/               # Next.js application (Vercel)
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/        # Pages Next.js
│   │   └── lib/          # API et utilitaires
│   └── styles/           # CSS Tailwind
├── scripts/              # Scripts scraping Python
├── backoffice/          # API routes (converties pour Vercel)
└── data/               # Données locales (non versionnées)
```

## 🚀 Technologies

- **Frontend**: Next.js, React, Tailwind CSS, Recharts
- **Backend**: Serverless Functions (Vercel)
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Python, BeautifulSoup, Requests
- **Deployment**: Vercel

## 📦 Installation

### Prérequis
- Node.js 18+
- Python 3.8+
- Compte Supabase

### 1. Cloner le repository
```bash
git clone https://github.com/[votre-username]/volley-cysoing.git
cd volley-cysoing
```

### 2. Installer les dépendances
```bash
# Frontend
cd frontend
npm install

# Scripts Python
cd ../scripts
pip install -r requirements.txt
```

### 3. Configurer Supabase
Créer les variables d'environnement :
```bash
# backoffice/.env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre-cle-publique
SUPABASE_SERVICE_KEY=votre-cle-service-role
```

## 🎯 Utilisation

### Développement local
```bash
# Frontend (port 3000)
cd frontend
npm run dev

# Backoffice (port 3026)
cd backoffice
npm start
```

### Production (Vercel)
- Frontend : `https://votre-app.vercel.app`
- API : Serverless Functions intégrées

## 📊 Fonctionnalités

### Frontend Public
- 🏆 Visualisation des classements
- 📅 Calendrier des matchs
- 📊 Statistiques détaillées
- 🎨 Interface responsive

### Administration
- 🕷️ Scraping des données FFVB
- 📤 Synchronisation Supabase
- 📋 Logs d'exécution
- 🔄 Gestion des données

## 🔧 Configuration Supabase

### Tables requises
- `teams` - Équipes
- `matches` - Matchs
- `standings` - Classements
- `matchdays` - Journées

Voir [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) pour les instructions détaillées.

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'environnement Vercel
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_KEY`

## 📝 API Endpoints

### Données
- `GET /api/standings` - Classements
- `GET /api/matches` - Matchs
- `GET /api/teams` - Équipes

### Administration
- `POST /api/scrape` - Lancer le scraping
- `POST /api/sync-supabase` - Synchroniser les données
- `GET /api/logs` - Logs système

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour les détails.

---

🏐 **Développé avec passion pour le volley-ball cysoingien !**