# scripts/scraper.py
import requests
from bs4 import BeautifulSoup
import json
import uuid
from datetime import datetime
from pathlib import Path
import sys
import time

# Import des utilitaires
from utils import generate_uuid, generate_team_uuid, get_timestamp, save_json, load_json, create_backup

class VolleyballScraper:
    def __init__(self):
        self.base_url = "https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php?saison=2025/2026&codent=PTFL59&poule=BFQ"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Configuration des dossiers
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
        
        # Données extraites
        self.matchdays = []  # Nouveau : journées de match
        self.teams = []
        self.matches = []
        self.standings = []
        
    def log(self, message, level="INFO"):
        """Fonction de logging"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        try:
            # Remove emojis and special characters that cause encoding issues
            clean_message = message.encode('ascii', 'ignore').decode('ascii')
            print(f"[{timestamp}] {level}: {clean_message}")
        except Exception:
            # Fallback to basic message if encoding still fails
            print(f"[{timestamp}] {level}: Logging message")
    
    def scrape_standings(self):
        """Extrait les classements du tableau de classement"""
        self.log("Début de l'extraction des classements...")
        
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            standings = []
            
            # Trouver le tableau de classement
            tables = soup.find_all('table', cellspacing='1', cellpadding='2')
            
            for table in tables:
                rows = table.find_all('tr')
                
                # Vérifier si c'est le tableau de classement
                header_row = rows[0] if rows else None
                if header_row and any('Points' in cell.get_text() for cell in header_row.find_all('td')):
                    
                    self.log(f"Tableau de classement trouvé avec {len(rows)} lignes")
                    
                    # Parser chaque ligne d'équipe
                    for row in rows[1:]:
                        if row.get('bgcolor') == '#EEEEF8':
                            standing = self.parse_standing_row(row)
                            if standing:
                                standings.append(standing)
                    break
            
            self.standings = standings
            self.log(f"{len(standings)} équipes extraites des classements")
            return standings
            
        except Exception as e:
            self.log(f"Erreur lors de l'extraction des classements: {e}", "ERROR")
            return []
    
    def parse_standing_row(self, row):
        """Parse une ligne de classement"""
        cells = row.find_all('td')
        if len(cells) < 19:
            return None
        
        try:
            team_name = cells[1].get_text(strip=True)
            
            # Validation et parsing sécurisés
            rank_text = cells[0].get_text(strip=True).replace('.', '')
            points_text = cells[2].get_text(strip=True)
            played_text = cells[3].get_text(strip=True)
            wins_text = cells[4].get_text(strip=True)
            losses_text = cells[5].get_text(strip=True)
            sets_won_text = cells[13].get_text(strip=True)
            sets_lost_text = cells[14].get_text(strip=True)
            points_for_text = cells[16].get_text(strip=True)
            points_against_text = cells[17].get_text(strip=True)
            ratio_text = cells[18].get_text(strip=True)
            
            # Vérifier que les champs ne sont pas vides
            if not team_name or not rank_text:
                return None
                
            return {
                "id": generate_team_uuid(team_name),
                "team_name": team_name,
                "rank": int(rank_text) if rank_text else 0,
                "points": int(points_text) if points_text else 0,
                "played": int(played_text) if played_text else 0,
                "wins": int(wins_text) if wins_text else 0,
                "losses": int(losses_text) if losses_text else 0,
                "sets_won": int(sets_won_text) if sets_won_text else 0,
                "sets_lost": int(sets_lost_text) if sets_lost_text else 0,
                "points_for": int(points_for_text) if points_for_text else 0,
                "points_against": int(points_against_text) if points_against_text else 0,
                "ratio": float(ratio_text) if ratio_text else 0.0,
                "created_at": get_timestamp(),
                "updated_at": get_timestamp()
            }
        except (ValueError, IndexError) as e:
            self.log(f"Erreur parsing ligne classement: {e}", "ERROR")
            return None
    
    def scrape_matches(self):
        """Extrait les matchs du calendrier"""
        self.log("Début de l'extraction des matchs...")
        
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            matches = []
            
            # Trouver les tableaux de matchs
            tables = soup.find_all('table', cellspacing='1', cellpadding='2')
            
            for table in tables:
                rows = table.find_all('tr')
                
                # Parser les lignes de matchs
                for row in rows:
                    if row.get('bgcolor') == '#EEEEF8':
                        match = self.parse_match_row(row)
                        if match:
                            matches.append(match)
            
            self.matches = matches
            self.log(f"{len(matches)} matchs extraits")
            return matches
            
        except Exception as e:
            self.log(f"Erreur lors de l'extraction des matchs: {e}", "ERROR")
            return []
    
    def parse_match_row(self, row):
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
            home_sets_text = cells[6].get_text(strip=True)
            away_sets_text = cells[7].get_text(strip=True)
            score_detail = cells[8].get_text(strip=True) if len(cells) > 8 else ""
            venue = cells[9].get_text(strip=True) if len(cells) > 9 else ""
            
            # Déterminer le gagnant
            winner = None
            if home_sets_text and away_sets_text:
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
                        home_score, away_score = set_score.split(':')
                        sets.append({
                            "home": int(home_score.strip()),
                            "away": int(away_score.strip())
                        })
            
            # Convertir la date
            match_date = None
            if date_text and '/' in date_text:
                day, month, year = date_text.split('/')
                match_date = f"20{year}-{month.zfill(2)}-{day.zfill(2)}"
            
            return {
                "id": generate_uuid(),
                "match_id": match_id,
                "date": match_date,
                "time": time_text,
                "home_team": home_team,
                "away_team": away_team,
                "venue": venue,
                "home_sets": int(home_sets_text) if home_sets_text else None,
                "away_sets": int(away_sets_text) if away_sets_text else None,
                "score_detail": score_detail,
                "sets": sets,
                "winner": winner,
                "status": "completed" if winner else "upcoming",
                "created_at": get_timestamp(),
                "updated_at": get_timestamp()
            }
        except (ValueError, IndexError) as e:
            self.log(f"Erreur parsing ligne match: {e}", "ERROR")
            return None
    
    def extract_teams_from_standings(self):
        """Extrait la liste des équipes depuis les classements"""
        teams = []
        
        for standing in self.standings:
            team = {
                "id": standing["id"],
                "name": standing["team_name"],
                "created_at": standing["created_at"],
                "updated_at": standing["updated_at"]
            }
            teams.append(team)
        
        self.teams = teams
        self.log(f"{len(teams)} équipes générées depuis les classements")
        return teams
    
    def create_backups(self):
        """Crée des backups des fichiers existants"""
        self.log("Création des backups...")
        
        files_to_backup = ['teams.json', 'matches.json', 'standings.json']
        for filename in files_to_backup:
            filepath = self.data_dir / filename
            if filepath.exists():
                backup_path = create_backup(str(filepath))
                if backup_path:
                    self.log(f"Backup créé: {backup_path}")
    
    def save_all_data(self):
        """Sauvegarde toutes les données extraites"""
        self.log("Sauvegarde des données...")
        
        # Sauvegarder chaque fichier
        files_to_save = {
            "teams.json": self.teams,
            # "matches.json": self.matches,
            "matches.json": self.matches,
            "matchdays.json": self.matchdays,
            "standings.json": self.standings
        }
        
        for filename, data in files_to_save.items():
            filepath = self.data_dir / filename
            save_json(data, str(filepath))
            self.log(f"{filename} sauvegardé ({len(data)} éléments)")
    
    def scrape_all_data(self):
        """Fonction principale de scraping"""
        self.log("=== DÉBUT DU SCRAPING VOLLEY-CYSOING ===")
        
        try:
            # 1. Créer les backups
            self.create_backups()
            
            # 2. Extraire les classements
            self.scrape_standings()
            
            # 3. Extraire les matchs
            self.scrape_matchdays_and_matches()
            
            # 4. Extraire les équipes depuis les classements
            self.extract_teams_from_standings()
            
            # 5. Sauvegarder toutes les données
            self.save_all_data()
            
            # 6. Rapport final
            self.log("=== RAPPORT FINAL ===")
            self.log(f"✅ Scraping terminé avec succès!")
            self.log(f"📊 Données générées:")
            self.log(f"  - Équipes: {len(self.teams)}")
            self.log(f"  - Matchs: {len(self.matches)}")
            self.log(f"  - Journées: {len(self.matchdays)}")
            self.log(f"  - Classements: {len(self.standings)}")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Erreur lors du scraping: {str(e)}", "ERROR")
            return False

    def extract_date_from_day_name(self, day_text):
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

    def scrape_matchdays_and_matches(self):
        """Extrait les journées et les matchs du calendrier"""
        self.log("Début de l'extraction des journées et matchs...")
        
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            matchdays = []
            matches = []
            current_matchday = None
            
            # Trouver tous les tableaux
            all_tables = soup.find_all('table')
            
            # Le tableau des matchs est le tableau 3 (index 3)
            if len(all_tables) > 3:
                match_table = all_tables[3]
                rows = match_table.find_all('tr')
                
                for row in rows:
                    # Vérifier si c'est une ligne d'en-tête de journée
                    header_cells = row.find_all('td', {'background': '../images/bkrg.gif'})
                    if header_cells and 'Journée' in header_cells[0].get_text():
                        # Sauvegarder la journée précédente si elle existe
                        if current_matchday:
                            matchdays.append(current_matchday)
                        
                        # Créer une nouvelle journée
                        day_text = header_cells[0].get_text(strip=True)
                        self.log(f"Nouvelle journée trouvée: {day_text}")
                        
                        current_matchday = {
                            "id": generate_uuid(),
                            "name": day_text,
                            "date": self.extract_date_from_day_name(day_text),
                            "match_ids": [],
                            "created_at": get_timestamp(),
                            "updated_at": get_timestamp()
                        }
                    
                    # Vérifier si c'est une ligne de match
                    elif row.get('bgcolor') == '#EEEEF8':
                        match = self.parse_match_row(row)
                        if match:
                            matches.append(match)
                            # Ajouter l'ID du match à la journée courante
                            if current_matchday:
                                current_matchday["match_ids"].append(match["match_id"])
                
                # Ajouter la dernière journée
                if current_matchday:
                    matchdays.append(current_matchday)
            
            self.matchdays = matchdays
            self.matches = matches
            self.log(f"{len(matchdays)} journées et {len(matches)} matchs extraits")
            return matchdays, matches
            
        except Exception as e:
            self.log(f"Erreur lors de l'extraction des journées et matchs: {e}", "ERROR")
            return [], []

def main():
    """Fonction principale"""
    scraper = VolleyballScraper()
    success = scraper.scrape_all_data()
    
    if success:
        print("\nScraping termine avec succes!")
        print("Prochaines etapes:")
        print("  1. Demarrer le backoffice: cd backoffice && npm start")
        print("  2. Acceder a http://localhost:3001")
        print(" 3. Lancer le scraping via l'interface")
        print(" 4. Demarrer le front-end: cd frontend && npm run dev")
        print(" 5. Acceder a http://localhost:3000")
    else:
        print("\nOperation echouee - verifiez les erreurs ci-dessus")
        sys.exit(1)

    def extract_date_from_day_name(self, day_text):
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

    def scrape_matchdays_and_matches(self):
        """Extrait les journées et les matchs du calendrier"""
        self.log("Début de l'extraction des journées et matchs...")
        
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            matchdays = []
            matches = []
            current_matchday = None
            
            # Trouver tous les tableaux
            all_tables = soup.find_all('table')
            
            # Le tableau des matchs est le tableau 3 (index 3)
            if len(all_tables) > 3:
                match_table = all_tables[3]
                rows = match_table.find_all('tr')
                
                for row in rows:
                    # Vérifier si c'est une ligne d'en-tête de journée
                    header_cells = row.find_all('td', {'background': '../images/bkrg.gif'})
                    if header_cells and 'Journée' in header_cells[0].get_text():
                        # Sauvegarder la journée précédente si elle existe
                        if current_matchday:
                            matchdays.append(current_matchday)
                        
                        # Créer une nouvelle journée
                        day_text = header_cells[0].get_text(strip=True)
                        self.log(f"Nouvelle journée trouvée: {day_text}")
                        
                        current_matchday = {
                            "id": generate_uuid(),
                            "name": day_text,
                            "date": self.extract_date_from_day_name(day_text),
                            "match_ids": [],
                            "created_at": get_timestamp(),
                            "updated_at": get_timestamp()
                        }
                    
                    # Vérifier si c'est une ligne de match
                    elif row.get('bgcolor') == '#EEEEF8':
                        match = self.parse_match_row(row)
                        if match:
                            matches.append(match)
                            # Ajouter l'ID du match à la journée courante
                            if current_matchday:
                                current_matchday["match_ids"].append(match["match_id"])
                
                # Ajouter la dernière journée
                if current_matchday:
                    matchdays.append(current_matchday)
            
            self.matchdays = matchdays
            self.matches = matches
            self.log(f"{len(matchdays)} journées et {len(matches)} matchs extraits")
            return matchdays, matches
            
        except Exception as e:
            self.log(f"Erreur lors de l'extraction des journées et matchs: {e}", "ERROR")
            return [], []

def main():
    """Fonction principale"""
    scraper = VolleyballScraper()
    success = scraper.scrape_all_data()
    
    if success:
        print("\nScraping termine avec succes!")
        print("Prochaines etapes:")
        print("  1. Demarrer le backoffice: cd backoffice && npm start")
        print("  2. Acceder a http://localhost:3001")
        print("  3. Lancer le scraping via l'interface")
        print("  4. Demarrer le front-end: cd frontend && npm run dev")
        print("  5. Acceder a http://localhost:3000")
    else:
        print("\nOperation echouee - verifiez les erreurs ci-dessus")
        sys.exit(1)

if __name__ == "__main__":
    main()
