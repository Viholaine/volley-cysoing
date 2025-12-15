import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Calendar, Users, BarChart3, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../lib/api';

export default function StandingsTable({ onTeamClick }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScoringInfo, setShowScoringInfo] = useState(false);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getStandings();
      setStandings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Classements
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rang
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Équipe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joués
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Victoires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Défaites
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sets Gagnés
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sets Perdus
              </th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standings.map((team, index) => (
              <tr key={team.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {team.rank}
                    </span>
                    {team.rank === 1 && (
                      <Trophy className="h-4 w-4 text-yellow-400 ml-2" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      {team.team_name}
                    </div>
                    <button
                      onClick={() => onTeamClick(team.team_name)}
                      className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Matchs
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {team.points}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.played}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.wins}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.losses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.sets_won}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.sets_lost}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {standings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun classement disponible
        </div>
      )}
      
      {/* Note d'information sur le calcul des points */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setShowScoringInfo(!showScoringInfo)}
          className="w-full px-6 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between text-left"
        >
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
            Calcul des points
          </h4>
          {showScoringInfo ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {showScoringInfo && (
          <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
            <div className="text-xs text-gray-600 space-y-1">
              <div>• <span className="font-medium">Match gagné en 2 sets</span> : 3 points</div>
              <div>• <span className="font-medium">Match gagné en 3 sets</span> : 2 points</div>
              <div>• <span className="font-medium">Match perdu en 3 sets</span> : 1 point</div>
              <div>• <span className="font-medium">Match perdu en 2 sets</span> : 0 point</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}