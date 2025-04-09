import { useState, useEffect } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type FetchFunction<T> = () => Promise<T>;

const useFetch = <T>(fetchFn: FetchFunction<T>): FetchState<T> => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const data = await fetchFn();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
      }
    };

    fetchData();
  }, [fetchFn]);

  return state;
};

export default useFetch;
