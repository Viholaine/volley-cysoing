# scripts/scraper_matchdays.py
import requests
from bs4 import BeautifulSoup
import json
import uuid
from datetime import datetime
from pathlib import Path
import sys

# Import des utilitaires
from utils import generate_uuid, get_timestamp, save_json, create_backup

def extract_date_from_day_name(day_text):
    """Extrait une date approximative depuis le nom de la journée"""
    try:
        day_number = day_text.split(' ')[1]
        date_mapping = {
            "01": "2025-10-04",
            "02": "2025-10-18", 
            "03": "2025-11-15",
            "04": "2025-11-29",
            "05": "2025-12-06"
        }
        return date_mapping.get(day_number, f"2025-01-{day_number.zfill(2)}")
    except:
        return "2025-01-01"

def parse_match_row(row):
    """Parse une ligne de match"""
    cells = row.find_all('td')
    if len(cells) < 10:
        return None
    
    try:
        match_id = cells[0].get_text(strip=True)
        if not match_id or 'BFQ' not in match_id:
            return None
        
        date_text = cells[1].get_text(strip=True)
        time_text = cells[2].get_text(strip=True)
        home_team = cells[3].get_text(strip=True)
        away_team = cells[5].get_text(strip=True)
        
        # Extraire les scores
        home_sets_text = cells[6].get_text(strip=True) if len(cells) > 6 else ""
        away_sets_text = cells[7].get_text(strip=True) if len(cells) > 7 else ""
        score_detail = cells[8].get_text(strip=True) if len(cells) > 8 else ""
        
        # Extraire le lieu
        venue = ""
        for i in range(len(cells)-1, -1, -1):
            cell_text = cells[i].get_text(strip=True)
            if cell_text and not cell_text.startswith('BFQ') and 'COMPLEXE' in cell_text.upper():
                venue = cell_text
                break
        
        # Déterminer le gagnant
        winner = None
        home_sets = None
        away_sets = None
        
        if home_sets_text and away_sets_text and home_sets_text.isdigit() and away_sets_text.isdigit():
            home_sets = int(home_sets_text)
            away_sets = int(away_sets_text)
            if home_sets > away_sets:
                winner = "home"
            elif away_sets > home_sets:
                winner = "away"
            else:
                winner = "draw"
        
        # Parser les scores de sets
        sets = []
        if score_detail:
            set_scores = score_detail.split(', ')
            for set_score in set_scores:
                if ':' in set_score:
                    try:
                        home_score, away_score = set_score.split(':')
                        sets.append({
                            "home": int(home_score.strip()),
                            "away": int(away_score.strip())
                        })
                    except ValueError:
                        continue
        
        # Convertir la date
        match_date = None
        if date_text and '/' in date_text:
            try:
                day, month, year = date_text.split('/')
                match_date = f"20{year}-{month.zfill(2)}-{day.zfill(2)}"
            except:
                match_date = date_text
        
        return {
            "id": generate_uuid(),
            "match_id": match_id,
            "date": match_date,
            "time": time_text,
            "home_team": home_team,
            "away_team": away_team,
            "venue": venue,
            "home_sets": home_sets,
            "away_sets": away_sets,
            "score_detail": score_detail,
            "sets": sets,
            "winner": winner,
            "status": "completed" if winner else "upcoming",
            "created_at": get_timestamp(),
            "updated_at": get_timestamp()
        }
    except (ValueError, IndexError) as e:
        print(f"Erreur parsing ligne match: {e}")
        return None

def main():
    print("=== EXTRACTION DES JOURNÉES ET MATCHS ===")
    
    base_url = "https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php?saison=2025/2026&codent=PTFL59&poule=BFQ"
    data_dir = Path("../data")
    data_dir.mkdir(exist_ok=True)
    
    try:
        response = requests.get(base_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        matchdays = []
        matches = []
        current_matchday = None
        
        # Trouver tous les tableaux
        all_tables = soup.find_all('table')
        print(f"Nombre de tableaux trouvés: {len(all_tables)}")
        
        # Le tableau des matchs est le tableau 3 (index 3)
        if len(all_tables) > 3:
            match_table = all_tables[3]
            rows = match_table.find_all('tr')
            print(f"Tableau de matchs: {len(rows)} lignes")
            
            for row in rows:
                # Vérifier si c'est une ligne d'en-tête de journée
                header_cells = row.find_all('td', {'background': '../images/bkrg.gif'})
                if header_cells and 'Journée' in header_cells[0].get_text():
                    # Sauvegarder la journée précédente si elle existe
                    if current_matchday:
                        matchdays.append(current_matchday)
                    
                    # Créer une nouvelle journée
                    day_text = header_cells[0].get_text(strip=True)
                    print(f"Nouvelle journée trouvée: {day_text}")
                    
                    current_matchday = {
                        "id": generate_uuid(),
                        "name": day_text,
                        "date": extract_date_from_day_name(day_text),
                        "match_ids": [],
                        "created_at": get_timestamp(),
                        "updated_at": get_timestamp()
                    }
                
                # Vérifier si c'est une ligne de match
                elif row.get('bgcolor') == '#EEEEF8':
                    match = parse_match_row(row)
                    if match:
                        matches.append(match)
                        # Ajouter l'ID du match à la journée courante
                        if current_matchday:
                            current_matchday["match_ids"].append(match["match_id"])
            
            # Ajouter la dernière journée
            if current_matchday:
                matchdays.append(current_matchday)
        
        # Sauvegarder les données
        print(f"Sauvegarde de {len(matchdays)} journées et {len(matches)} matchs...")
        
        # Backup des fichiers existants
        for filename in ['matchdays.json', 'matches.json']:
            filepath = data_dir / filename
            if filepath.exists():
                backup_path = create_backup(str(filepath))
                if backup_path:
                    print(f"Backup créé: {backup_path}")
        
        # Sauvegarder les nouvelles données
        save_json(matchdays, str(data_dir / "matchdays.json"))
        save_json(matches, str(data_dir / "matches.json"))
        
        print("SUCCESS: Extraction terminee!")
        print(f"  - Journées: {len(matchdays)}")
        print(f"  - Matchs: {len(matches)}")
        
        # Afficher un exemple de journée
        if matchdays:
            print(f"\nExemple de journée:")
            print(f"  Nom: {matchdays[0]['name']}")
            print(f"  Date: {matchdays[0]['date']}")
            print(f"  Matchs: {len(matchdays[0]['match_ids'])}")
        
        # Afficher un exemple de match
        if matches:
            print(f"\nExemple de match:")
            match = matches[0]
            print(f"  ID: {match['match_id']}")
            print(f"  Date: {match['date']}")
            print(f"  Équipes: {match['home_team']} vs {match['away_team']}")
            print(f"  Score: {match['home_sets']}-{match['away_sets']}")
        
    except Exception as e:
        print(f"ERROR: Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
