import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Trophy, Filter, ChevronDown } from 'lucide-react';
import apiClient from '../lib/api';

export default function RecentMatches({ teamFilter: initialTeamFilter = 'all' }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtres
  const [selectedTeam, setSelectedTeam] = useState(initialTeamFilter);
  const [selectedMatchDay, setSelectedMatchDay] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [filteredMatches, setFilteredMatches] = useState([]);

  // Liste des équipes et journées (extraite des matchs)
  const [teams, setTeams] = useState([]);
  const [matchDays, setMatchDays] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    // Mettre à jour le filtre d'équipe quand il change depuis le classement
    setSelectedTeam(initialTeamFilter);
  }, [initialTeamFilter]);

  useEffect(() => {
    // Extraire la liste des équipes uniques
    const allTeams = new Set();
    matches.forEach(match => {
      allTeams.add(match.home_team);
      allTeams.add(match.away_team);
    });
    setTeams(Array.from(allTeams).sort());

    // Extraire les journées uniques (basées sur la date)
    const uniqueDates = [...new Set(matches.map(match => match.date))].sort();
    setMatchDays(uniqueDates);
  }, [matches]);

  useEffect(() => {
    // Filtrer les matchs selon le statut
    let filtered = matches.filter(match => {
      if (showUpcoming) {
        // Afficher tous les matchs (passés et à venir)
        return true;
      } else {
        // Afficher uniquement les matchs terminés
        return match.winner && match.score_detail;
      }
    });

    if (selectedTeam !== 'all') {
      filtered = filtered.filter(match => 
        match.home_team === selectedTeam || match.away_team === selectedTeam
      );
    }

    if (selectedMatchDay !== 'all') {
      filtered = filtered.filter(match => 
        match.date === selectedMatchDay
      );
    }

    setFilteredMatches(filtered);
  }, [matches, selectedTeam, selectedMatchDay, showUpcoming]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getMatches();
      // Trier par date du plus récent au plus ancien
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      setMatches(sortedData); // Tous les matchs triés
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatus = (match) => {
    if (match.winner && match.score_detail) {
      return 'completed';
    } else if (!match.winner && !match.score_detail) {
      return 'upcoming';
    } else {
      return 'in_progress';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'upcoming':
        return 'À venir';
      case 'in_progress':
        return 'En cours';
      default:
        return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Matchs Terminés
        </h3>
        
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par équipe
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les équipes</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par journée
            </label>
            <select
              value={selectedMatchDay}
              onChange={(e) => setSelectedMatchDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les journées</option>
              {matchDays.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de matchs
            </label>
            <select
              value={showUpcoming ? 'upcoming' : 'completed'}
              onChange={(e) => setShowUpcoming(e.target.value === 'upcoming')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="completed">Matchs terminés</option>
              <option value="upcoming">Tous les matchs</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {matches.length === 0 ? 'Aucun match disponible' : 'Aucun match trouvé pour ces filtres'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMatches.map((match) => {
              const status = getMatchStatus(match);
              return (
                <div key={match.match_id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(match.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900">
                        {match.home_team}
                      </div>
                      <span className="text-gray-500">vs</span>
                      <div className="text-sm font-medium text-gray-900">
                        {match.away_team}
                      </div>
                    </div>
                    
                    {/* Affichage du score et vainqueur */}
                    {status === 'completed' && match.score_detail ? (
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {match.home_sets} - {match.away_sets}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {match.score_detail}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          🏆 {match.winner === 'home' ? match.home_team : match.away_team}
                        </div>
                      </div>
                    ) : status === 'upcoming' ? (
                      <div className="text-right">
                        <div className="text-sm text-blue-600 font-medium">
                          À venir
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(match.date).toLocaleDateString('fr-FR')} {match.time}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        En cours
                      </div>
                    )}
                  </div>
                  
                  {match.venue && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {match.venue}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}