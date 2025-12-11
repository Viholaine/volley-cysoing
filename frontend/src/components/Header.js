import { Trophy, Users, Calendar, RefreshCw } from 'lucide-react';
import LastScrapeInfo from './LastScrapeInfo';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Volleyball Cysoing</h1>
            </div>
            <span className="text-blue-100">Visualisation des scores</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <LastScrapeInfo />
          </div>
        </div>
      </div>
    </header>
  );
}