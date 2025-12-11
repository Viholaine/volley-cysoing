# Configuration Supabase pour Volleyball Cysoing

## Étapes de configuration :

### 1. Créer la table standings
Exécutez le script SQL `scripts/create_standings_table.sql` dans l'éditeur SQL de votre projet Supabase.

### 2. Configurer les identifiants
Éditez le fichier `backoffice/.env` et ajoutez vos identifiants Supabase :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre-cle-publique
SUPABASE_SERVICE_KEY=votre-cle-service-role
```

### 3. Tester la synchronisation
1. Assurez-vous que les données sont présentes dans `data/teams.json` et `data/standings.json`
2. Lancez le backoffice : `cd backoffice && npm start`
3. Cliquez sur le bouton "Charger les données" dans l'interface

## Fonctionnalités :

- **Teams** : Insertion incrémentale basée sur le nom de l'équipe
- **Standings** : Insertion complète de toutes les données
- **Gestion erreurs** : Arrêt complet en cas d'échec avec logs détaillés
- **Logging** : Toutes les opérations sont tracées dans l'interface

## Notes de sécurité :

- Ne jamais exposer la clé `SUPABASE_SERVICE_KEY` côté client
- La clé service permet les écritures complètes dans la base
- Conservez le fichier `.env` hors du contrôle de version