import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Statistics() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3026/api-supabase/standings');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const data = await response.json();
      setStandings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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

  // Préparer les données pour les graphiques
  const totalWins = standings.reduce((sum, team) => sum + (team.wins || 0), 0);
  const totalLosses = standings.reduce((sum, team) => sum + (team.losses || 0), 0);
  const totalPoints = standings.reduce((sum, team) => sum + (team.points || 0), 0);

  const winLossData = [
    { name: 'Victoires', value: totalWins, fill: '#10B981' },
    { name: 'Défaites', value: totalLosses, fill: '#EF4444' }
  ];

  const pointsData = standings.slice(0, 5).map(team => ({
    name: team.team_name || 'Unknown',
    points: team.points || 0,
    fill: '#3B82F6'
  }));

  const pieData = standings.map(team => ({
    name: team.team_name || 'Unknown',
    value: team.points || 0
  }));

  return (
    <div className="space-y-6">
      {/* Carte de statistiques générales */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Statistiques Générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{standings.length}</div>
            <div className="text-sm text-blue-600">Équipes</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalWins}</div>
            <div className="text-sm text-green-600">Victoires</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{totalLosses}</div>
            <div className="text-sm text-red-600">Défaites</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
            <div className="text-sm text-purple-600">Points Total</div>
          </div>
        </div>
      </div>

      {/* Graphique Victoires/Défaites */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Victoires vs Défaites</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={winLossData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique des points par équipe */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 Points par Équipe (Top 5)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pointsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="points" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique circulaire des points */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Répartition des Points</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}