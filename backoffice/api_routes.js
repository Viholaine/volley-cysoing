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

// Route pour effacer les logs
app.delete('/api/logs', (req, res) => {
  logs.length = 0; // Vider le tableau de logs
  addLog('Logs effacés', 'info');
  res.json({ success: true, message: 'Logs effacés' });
});