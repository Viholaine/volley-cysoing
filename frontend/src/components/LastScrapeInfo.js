import { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

export default function LastScrapeInfo() {
  const [lastScrape, setLastScrape] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLastScrape();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchLastScrape, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLastScrape = async () => {
    try {
      const response = await fetch('/api/last-scrape');
      const data = await response.json();
      setLastScrape(data);
    } catch (error) {
      console.error('Erreur récupération dernier scraping:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-sm text-blue-100">
        <div className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  const lastUpdate = formatDateTime(lastScrape?.timestamp);

  return (
    <div className="text-sm text-blue-100">
      <div className="flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        <span>{lastUpdate || 'Jamais'}</span>
      </div>
    </div>
  );
}