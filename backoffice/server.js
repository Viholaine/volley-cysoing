require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Importer les routes Supabase
const supabaseRoutes = require('./supabase_routes');

const app = express();
const PORT = process.env.PORT || 3026;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Logs pour suivre l'exécution
const logs = [];

function addLog(message, type = 'info') {
  const timestamp = new Date().toISOString();
  logs.push({ timestamp, message, type });
  if (logs.length > 100) logs.shift(); // Garder seulement les 100 derniers logs
  console.log(`[${timestamp}] ${message}`);
}

// Configurer les routes Supabase
supabaseRoutes(app, addLog);

// Route pour obtenir les logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Route pour obtenir les classements spécifiquement
app.get('/api/standings', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'standings.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const standings = JSON.parse(fileContent);
      
      // Trier par rang
      const sortedStandings = standings.sort((a, b) => a.rank - b.rank);
      
      res.json(sortedStandings);
    } else {
      res.json([]);
    }
  } catch (error) {
    addLog(`Erreur lecture classements: ${error.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les matchs spécifiquement
app.get('/api/matches', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'matches.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const matches = JSON.parse(fileContent);
      
      // Trier par date (plus récents d'abord)
      const sortedMatches = matches.sort((a, b) => {
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        return 0;
      });
      
      res.json(sortedMatches);
    } else {
      res.json([]);
    }
  } catch (error) {
    addLog(`Erreur lecture matchs: ${error.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les équipes spécifiquement
app.get('/api/teams', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'teams.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const teams = JSON.parse(fileContent);
      
      // Trier par nom
      const sortedTeams = teams.sort((a, b) => a.name.localeCompare(b.name));
      
      res.json(sortedTeams);
    } else {
      res.json([]);
    }
  } catch (error) {
    addLog(`Erreur lecture équipes: ${error.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

// Route pour lancer le scraping
app.post('/api/scrape', async (req, res) => {
  const scrapeStartTime = new Date().toISOString();
  addLog('Début du scraping...', 'info');
  
  try {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../scripts/scraper.py')
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      addLog(data.toString().trim(), 'success');
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      addLog(data.toString().trim(), 'error');
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        addLog('Scraping terminé avec succès', 'success');
        
        // Enregistrer la date du scraping réussi
        try {
          // Compter les données extraites
          const dataDir = path.join(__dirname, '../data');
          let teamsCount = 0, matchesCount = 0, standingsCount = 0;
          
          try {
            const teamsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'teams.json'), 'utf8'));
            teamsCount = teamsData.length;
          } catch (e) {}
          
          try {
            const matchesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'matches.json'), 'utf8'));
            matchesCount = matchesData.length;
          } catch (e) {}
          
          try {
            const standingsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'standings.json'), 'utf8'));
            standingsCount = standingsData.length;
          } catch (e) {}
          
          const scrapeData = {
            timestamp: scrapeStartTime,
            success: true,
            teams_count: teamsCount,
            matches_count: matchesCount,
            standings_count: standingsCount,
            duration: new Date().toISOString()
          };
          
          fs.writeFileSync(
            path.join(__dirname, '../data/last_scrape.json'),
            JSON.stringify(scrapeData, null, 2)
          );
          
          addLog(`Scraping enregistré: ${scrapeStartTime} (${teamsCount} équipes, ${matchesCount} matchs, ${standingsCount} classements)`, 'success');
        } catch (saveError) {
          addLog(`Erreur enregistrement scraping: ${saveError.message}`, 'error');
        }
        
        res.json({ 
          success: true, 
          message: 'Scraping terminé',
          output: output 
        });
      } else {
        addLog(`Scraping échoué avec le code ${code}`, 'error');
        res.status(500).json({ 
          success: false, 
          message: 'Scraping échoué',
          error: errorOutput 
        });
      }
    });

  } catch (error) {
    addLog(`Erreur lors du scraping: ${error.message}`, 'error');
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour synchroniser avec Supabase
app.post('/api/load-to-supabase', async (req, res) => {
  addLog('Début de la synchronisation Supabase...', 'info');
  
  try {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../scripts/final_sync.py')
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      addLog(data.toString().trim(), 'info');
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      addLog(data.toString().trim(), 'error');
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        addLog('Synchronisation Supabase terminée avec succès', 'success');
        res.json({ success: true, message: 'Synchronisation réussie' });
      } else {
        addLog(`Erreur synchronisation (code ${code}): ${errorOutput}`, 'error');
        res.status(500).json({ success: false, message: errorOutput });
      }
    });
    
  } catch (error) {
    addLog(`Erreur critique synchronisation: ${error.message}`, 'error');
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour obtenir la date du dernier scraping
app.get('/api/last-scrape', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/last_scrape.json');
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ 
        timestamp: null, 
        success: false,
        message: 'Aucun scraping effectué' 
      });
    }
  } catch (error) {
    addLog(`Erreur lecture dernier scraping: ${error.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

// Route pour vérifier l'état des données
app.get('/api/status', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const files = ['teams.json', 'matches.json', 'standings.json', 'matchdays.json'];
    const status = {};
    
    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        status[file.replace('.json', '')] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime
        };
      } else {
        status[file.replace('.json', '')] = { exists: false };
      }
    });
    
    res.json(status);
  } catch (error) {
    addLog(`Erreur vérification statut: ${error.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

// Route pour effacer les logs
app.delete('/api/logs', (req, res) => {
  logs.length = 0; // Vider le tableau de logs
  addLog('Logs effacés', 'info');
  res.json({ success: true, message: 'Logs effacés' });
});

// Route principale pour servir l'interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  addLog(`Serveur backoffice démarré sur http://localhost:${PORT}`, 'info');
  console.log(`🏐 Backoffice Volleyball démarré sur http://localhost:${PORT}`);
});