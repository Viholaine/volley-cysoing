import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import StandingsTable from '../components/StandingsTable';
import RecentMatches from '../components/RecentMatches';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('standings');
  const [teamFilter, setTeamFilter] = useState('all');

  return (
    <>
      <Head>
        <title>Volleyball Cysoing - Visualisation des scores</title>
        <meta name="description" content="Visualisation des scores et classements du volley-ball Cysoing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Navigation par onglets */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['standings', 'matches'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'standings' && '🏆 Classements'}
                    {tab === 'matches' && '📅 Matchs'}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="space-y-6">
            {activeTab === 'standings' && <StandingsTable onTeamClick={(team) => { setTeamFilter(team); setActiveTab('matches'); }} />}
            {activeTab === 'matches' && <RecentMatches teamFilter={teamFilter} />}
          </div>
        </main>
      </div>
    </>
  );
}