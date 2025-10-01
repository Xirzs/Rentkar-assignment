// hooks/usePartners.ts
import { useState, useEffect, useCallback } from 'react';

interface Partner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'online' | 'busy' | 'offline';
  location?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
  vehicleInfo?: {
    type: string;
    model: string;
    number: string;
    capacity: number;
  };
  rating?: number;
  completedBookings?: number;
  createdAt: string;
  lastActiveAt: string;
}

interface UsePartnersOptions {
  filterStatus?: 'online' | 'busy' | 'offline';
  autoFetch?: boolean;
  sortBy?: 'rating' | 'completedBookings' | 'lastActiveAt';
}

interface UsePartnersReturn {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getOnlinePartners: () => Partner[];
  getPartnerById: (id: string) => Partner | undefined;
  stats: {
    total: number;
    online: number;
    busy: number;
    offline: number;
  };
}

export function usePartners(options: UsePartnersOptions = {}): UsePartnersReturn {
  const {
    filterStatus,
    autoFetch = true,
    sortBy = 'rating'
  } = options;

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch partners from API
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/partners');
      
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }

      const data = await response.json();
      let fetchedPartners = data.partners || [];

      // Apply status filter
      if (filterStatus) {
        fetchedPartners = fetchedPartners.filter(
          (p: Partner) => p.status === filterStatus
        );
      }

      // Apply sorting
      fetchedPartners.sort((a: Partner, b: Partner) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'completedBookings':
            return (b.completedBookings || 0) - (a.completedBookings || 0);
          case 'lastActiveAt':
            return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
          default:
            return 0;
        }
      });

      setPartners(fetchedPartners);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError(err instanceof Error ? err.message : 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, sortBy]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchPartners();
    }
  }, [autoFetch, fetchPartners]);

  // Get only online partners
  const getOnlinePartners = useCallback(() => {
    return partners.filter(p => p.status === 'online');
  }, [partners]);

  // Get partner by ID
  const getPartnerById = useCallback((id: string) => {
    return partners.find(p => p._id === id);
  }, [partners]);

  // Calculate statistics
  const stats = {
    total: partners.length,
    online: partners.filter(p => p.status === 'online').length,
    busy: partners.filter(p => p.status === 'busy').length,
    offline: partners.filter(p => p.status === 'offline').length,
  };

  return {
    partners,
    loading,
    error,
    refetch: fetchPartners,
    getOnlinePartners,
    getPartnerById,
    stats,
  };
}