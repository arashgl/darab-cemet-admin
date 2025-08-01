import { useEffect, useState } from 'react';
import { TicketDetailPage } from './TicketDetailPage';
import { TicketsPage } from './TicketsPage';

export function TicketsRouter() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Handle URL hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove #

      if (hash.startsWith('tickets/')) {
        const ticketId = hash.split('/')[1];
        if (ticketId) {
          setSelectedTicketId(ticketId);
          setCurrentView('detail');
        }
      } else if (hash === 'tickets' || hash === '') {
        setCurrentView('list');
        setSelectedTicketId(null);
      }
    };

    // Handle initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleBackToList = () => {
    window.location.hash = 'tickets';
    setCurrentView('list');
    setSelectedTicketId(null);
  };

  if (currentView === 'detail' && selectedTicketId) {
    return (
      <TicketDetailPage ticketId={selectedTicketId} onBack={handleBackToList} />
    );
  }

  return <TicketsPage />;
}
