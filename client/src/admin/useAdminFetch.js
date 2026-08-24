import { useState, useEffect, useCallback } from 'react';
import { getAdminToken } from '../utils/api';

export default function useAdminFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const token = getAdminToken();
      const res = await fetch(url, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [data, loading, error, fetchData];
}
