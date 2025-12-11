# Test de synchronisation Supabase

## Instructions :

1. **Configurez vos identifiants Supabase** dans `backoffice/.env` :
   ```env
   SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_KEY=votre-cle-publique
   SUPABASE_SERVICE_KEY=votre-cle-service-role
   ```

2. **Créez la table standings** dans Supabase avec le script `scripts/create_standings_table.sql`

3. **Testez la synchronisation** :
   - Accédez au backoffice : http://localhost:3010
   - Cliquez sur "Charger les données"
   - Vérifiez les logs dans l'interface

## État actuel :

✅ **Infrastructure prête** :
- Script de synchronisation Python créé
- API backend configurée
- Interface backoffice prête
- Dépendances installées

⏳ **Configuration requise** :
- Identifiants Supabase à configurer
- Table standings à créer

## Fonctionnalités implémentées :

- **Teams** : Déduplication basée sur le nom
- **Standings** : Insertion complète
- **Gestion erreurs** : Arrêt complet en cas d'échec
- **Logging** : Traçabilité complète des opérations

## Prochaines étapes :

1. Configurer les identifiants Supabase
2. Créer la table standings
3. Tester la synchronisation
4. Valider les données dans Supabase