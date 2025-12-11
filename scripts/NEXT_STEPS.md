# 🚀 ÉTAPES SUIVANTES - CORRECTION TABLES SUPABASE

## 📋 INSTRUCTIONS À SUIVRE

### 1. **CORRECTION DES STRUCTURES DE TABLES** ⚠️ **URGENT**

Copiez et exécutez ce SQL dans l'éditeur SQL Supabase :

```sql
-- Correction table matchdays
ALTER TABLE matchdays ADD COLUMN IF NOT EXISTS match_date DATE;

-- Correction table matches  
ALTER TABLE matches ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time TIME;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_sets INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_sets INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS score_detail TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS sets JSONB DEFAULT '[]';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS winner VARCHAR(10);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team VARCHAR(100);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team VARCHAR(100);
```

### 2. **SYNCHRONISATION COMPLÈTE**

Une fois les tables corrigées :

```bash
cd /c/Workspace/volley-cysoing/scripts
python final_sync.py
```

### 3. **VÉRIFICATION BACKOFFICE**

Testez l'interface :
- http://localhost:3026/matchdays
- http://localhost:3026/matches

### 4. **VÉRIFICATION API**

```bash
curl http://localhost:3026/api-supabase/matchdays
curl http://localhost:3026/api-supabase/matches
```

---

## 🎯 **OBJECTIF**

Après ces étapes :
- ✅ Toutes les données synchronisées
- ✅ Plus d'erreurs de colonnes manquantes  
- ✅ Interface backoffice complète
- ✅ UUID déterministes fonctionnels

**Le script SQL est prêt dans `fix_supabase_tables.sql`**