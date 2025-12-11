# scripts/final_sync.py
import json
import os
from pathlib import Path

def load_env():
    """Charge les variables d'environnement depuis le fichier .env du backoffice"""
    env_path = Path("../backoffice/.env")
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
        print("Variables d'environnement chargees")
    else:
        print("Fichier .env non trouve")

def main():
    print("=== SYMCHRONISATION FINALE SUPABASE ===")
    
    # Charger les variables d'environnement
    load_env()
    
    from supabase import create_client
    
    # Configuration Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    # Créer le client Supabase
    supabase = create_client(supabase_url, supabase_key)
    
    # Charger les données
    data_dir = Path("../data")
    
    # Charger et adapter les matchdays
    with open(data_dir / "matchdays.json", 'r', encoding='utf-8') as f:
        matchdays = json.load(f)
    
    # Adapter les matchdays pour la structure existante
    adapted_matchdays = []
    for matchday in matchdays:
        adapted_matchday = {
            "name": matchday["name"],  # Garder le nom complet
            "day_number": matchday["name"].split(" ")[1],  # Extraire "01" de "Journée 01"
            "date_text": matchday["date"],  # Ajouter date_text pour le trigger
            "match_date": matchday["date"],
            "match_ids": matchday["match_ids"]
        }
        adapted_matchdays.append(adapted_matchday)
    
    print(f"Matchdays adaptes: {len(adapted_matchdays)}")
    
    # Synchroniser les matchdays
    result = supabase.table('matchdays').upsert(adapted_matchdays).execute()
    print(f"Matchdays synchronises: {len(result.data)}")
    
    # Charger et adapter les matches
    with open(data_dir / "matches.json", 'r', encoding='utf-8') as f:
        matches = json.load(f)
    
    # Adapter les matches pour la structure existante
    adapted_matches = []
    for match in matches:
        adapted_match = {
            "match_id": match["match_id"],
            
            "date": match["date"],
            "time": match.get("time", "00:00"),
            "home_team": match["home_team"],
            "away_team": match["away_team"],
            "venue": match.get("venue", ""),
            "score_detail": match["score_detail"],
            "home_sets": match["home_sets"],
            "away_sets": match["away_sets"],
            "winner": match["winner"],
            "sets": match["sets"],
            "status": match.get("status", "upcoming"),
            "created_at": match["created_at"]
        }
        adapted_matches.append(adapted_match)
    
    print(f"Matches adaptes: {len(adapted_matches)}")
    
    # Synchroniser les matches
    result = supabase.table('matches').upsert(adapted_matches, on_conflict='match_id').execute()
    print(f"Matches synchronises: {len(result.data)}")
    
    # Synchroniser les standings (classements)
    with open(data_dir / "standings.json", 'r', encoding='utf-8') as f:
        standings = json.load(f)
    
    # Adapter les standings pour la structure existante
    adapted_standings = []
    for standing in standings:
        adapted_standing = {
            "id": standing["id"],  # Ajouter l'UUID déterministe
            "team_name": standing["team_name"],
            "rank": standing["rank"],
            "points": standing["points"],
            "played": standing["played"],
            "wins": standing["wins"],
            "losses": standing["losses"],
            "sets_won": standing["sets_won"],
            "sets_lost": standing["sets_lost"],
            "points_for": standing["points_for"],
            "points_against": standing["points_against"],
            "ratio": standing["ratio"]
        }
        adapted_standings.append(adapted_standing)
    
    print(f"Standings adaptes: {len(adapted_standings)}")
    
    # Supprimer d'abord les anciens standings pour éviter les doublons
    print("Suppression des anciens classements...")
    supabase.table('standings').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    
    # Insérer les nouveaux standings
    result = supabase.table('standings').insert(adapted_standings).execute()
    print(f"Standings synchronises: {len(result.data)}")
    
    print("Synchronisation terminee avec succes!")
    
    # Afficher un résumé
    print("\nRESUME:")
    print(f"- Journées: {len(adapted_matchdays)}")
    print(f"- Matchs: {len(adapted_matches)}")
    print(f"- Classements: {len(adapted_standings)}")
    print("\nStructure des journées:")
    print(f"- day_number: ex: '01'")
    print(f"- date_text: ex: 'Journée 01'")
    print(f"- date: ex: '2025-10-04'")
    print(f"- match_ids: ['BFQ001', 'BFQ002', ...]")
    print("\nStructure des matchs:")
    print(f"- match_id: ex: 'BFQ001'")
    print(f"- home: ex: 'CAMBRAI 1'")
    print(f"- away: ex: 'HELLEMMES-LILLE 1'")
    print(f"- score_text: ex: '25:11, 25:8'")
    print("- sets: [{'home': 25, 'away': 11}, ...]")

if __name__ == "__main__":
    main()
