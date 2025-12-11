# Test de synchronisation via API

## Test du bouton "Charger les données" dans le backoffice

### Instructions :
1. Accédez au backoffice : http://localhost:3010
2. Cliquez sur le bouton "Charger les données"
3. Surveillez les logs dans l'interface

### Résultat attendu :
- ✅ Connexion Supabase établie
- ✅ 6 équipes chargées (déjà existantes)
- ✅ 6 classements synchronisés avec succès
- ✅ Message de succès affiché

### En cas d'erreur :
Les logs détaillés s'afficheront dans la section "Logs d'exécution" du backoffice.