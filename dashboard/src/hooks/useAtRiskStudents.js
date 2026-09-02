import { useState, useEffect, useCallback } from "react";
import { fetchAtRiskStudents } from "../api/students";

export function useAtRiskStudents(token) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchAtRiskStudents(token);
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { students, loading, error, refresh: loadData };
}
