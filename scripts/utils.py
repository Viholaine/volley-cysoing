# scripts/utils.py
import json
import uuid
from datetime import datetime
from pathlib import Path

def generate_uuid():
    """Génère un UUID v4"""
    return str(uuid.uuid4())

def get_timestamp():
    """Retourne le timestamp actuel au format ISO"""
    return datetime.now().isoformat() + 'Z'

def save_json(data, filepath):
    """Sauvegarde des données en JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_json(filepath):
    """Charge des données depuis un fichier JSON"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        return None

def create_backup(filepath):
    """Crée un backup timestampé d'un fichier"""
    if not Path(filepath).exists():
        return None
    
    backup_dir = Path(filepath).parent / "backups"
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = Path(filepath).name
    backup_path = backup_dir / f"{filename}_{timestamp}.json"
    
    import shutil
    shutil.copy2(filepath, backup_path)
    return backup_path
def generate_team_uuid(team_name):
    """Génère un UUID déterministe basé sur le nom d'équipe"""
    import hashlib
    # Crée un hash MD5 consistant basé sur le nom de l'équipe
    hash_object = hashlib.md5(team_name.encode('utf-8'))
    # Convertit le hash en UUID v5-like pour garantir l'unicité
    return str(uuid.UUID(hash_object.hexdigest()[:32]))
