// Routes Supabase pour Volleyball Cysoing
const { createClient } = require('@supabase/supabase-js');

// Créer le client Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key'
);

// Fonction pour configurer les routes Supabase
function setupSupabaseRoutes(app, addLog) {
  // Route pour obtenir les équipes depuis Supabase
  app.get('/api-supabase/teams', async (req, res) => {
    try {
      addLog('Récupération des équipes depuis Supabase...', 'info');
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) {
        addLog(`Erreur Supabase équipes: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
        return;
      }
      
      addLog(`${data.length} équipes récupérées depuis Supabase`, 'success');
      res.json(data);
      
    } catch (error) {
      addLog(`Erreur critique équipes Supabase: ${error.message}`, 'error');
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour obtenir les classements depuis Supabase
  app.get('/api-supabase/standings', async (req, res) => {
    try {
      addLog('Récupération des classements depuis Supabase...', 'info');
      
      const { data, error } = await supabase
        .from('standings')
        .select('*')
        .order('rank');
      
      if (error) {
        addLog(`Erreur Supabase classements: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
        return;
      }
      
      addLog(`${data.length} classements récupérés depuis Supabase`, 'success');
      res.json(data);
      
    } catch (error) {
      addLog(`Erreur critique classements Supabase: ${error.message}`, 'error');
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour obtenir les matchs depuis Supabase
  app.get('/api-supabase/matches', async (req, res) => {
    try {
      addLog('Récupération des matchs depuis Supabase...', 'info');
      
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        addLog(`Erreur Supabase matchs: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
        return;
      }
      
      addLog(`${data.length} matchs récupérés depuis Supabase`, 'success');
      res.json(data);
      
    } catch (error) {
      addLog(`Erreur critique matchs Supabase: ${error.message}`, 'error');
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour obtenir les journées depuis Supabase
  app.get('/api-supabase/matchdays', async (req, res) => {
    try {
      addLog('Récupération des journées depuis Supabase...', 'info');
      
      const { data, error } = await supabase
        .from('matchdays')
        .select('*')
        .order('day_number');
      
      if (error) {
        addLog(`Erreur Supabase journées: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
        return;
      }
      
      addLog(`${data.length} journées récupérées depuis Supabase`, 'success');
      res.json(data);
      
    } catch (error) {
      addLog(`Erreur critique journées Supabase: ${error.message}`, 'error');
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = setupSupabaseRoutes;
