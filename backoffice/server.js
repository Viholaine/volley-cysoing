require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

// Importer les routes Supabase
const supabaseRoutes = require('./supabase_routes');

const app = express();
const PORT = process.env.PORT || 3026;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// Rediriger les anciennes routes vers les nouvelles routes Supabase
app.get('/api/standings', (req, res) => {
  res.redirect(307, '/api-supabase/standings');
});

app.get('/api/matches', (req, res) => {
  res.redirect(307, '/api-supabase/matches');
});

app.get('/api/teams', (req, res) => {
  res.redirect(307, '/api-supabase/teams');
});

// Route pour lancer le scraping
app.post('/api/scrape', async (req, res) => {
  const scrapeStartTime = new Date().toISOString();
  addLog('Début du scraping...', 'info');
  
  try {
    const pythonProcess = spawn('python', [
      'scripts/scraper.py'
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
        
        res.json({ 
          success: true, 
          message: 'Scraping terminé',
          output: output,
          timestamp: scrapeStartTime
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
      'scripts/final_sync.py'
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
app.get('/api/last-scrape', async (req, res) => {
  try {
    // Pour l'instant, retourner un message indiquant que cette fonctionnalité nécessite une implémentation alternative
    // Dans une version serverless, cela pourrait être stocké dans Supabase ou un service de stockage
    res.json({ 
      timestamp: null, 
      success: false,
      message: 'Fonctionnalité désactivée - utilisez uniquement Supabase' 
    });
  } catch (error) {
    addLog(`Erreur lecture dernier scraping: ${error.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

// Route pour vérifier l'état des données
app.get('/api/status', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || 'https://your-project.supabase.co',
      process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key'
    );

    const status = {};
    const tables = ['teams', 'matches', 'standings', 'matchdays'];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          status[table] = { 
            exists: false, 
            error: error.message,
            connected: false 
          };
        } else {
          status[table] = { 
            exists: true, 
            count: count || 0,
            connected: true,
            last_checked: new Date().toISOString()
          };
        }
      } catch (error) {
        status[table] = { 
          exists: false, 
          error: error.message,
          connected: false 
        };
      }
    }
    
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
  res.sendFile('public/index.html', { root: __dirname });
});

// Démarrage du serveur
app.listen(PORT, () => {
  addLog(`Serveur backoffice démarré sur http://localhost:${PORT}`, 'info');
  console.log(`🏐 Backoffice Volleyball démarré sur http://localhost:${PORT}`);
});