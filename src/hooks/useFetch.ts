/* eslint-disable */

import { useEffect, useState } from "react";

let cache: { [key: string]: any } = {};

export function useFetch<
  _,
  T extends (url: string, ...args: any) => Promise<unknown>
>(
  key: string,
  query: T
): {
  data: Awaited<ReturnType<T>> | null;
  loading: boolean;
  error: boolean;
  mutate: () => Promise<any>;
} {
  const [data, setData] = useState<any>(cache[key] || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(false);

  const mutate = () =>
    query(key)
      .then((res) => {
        cache[key] = res;
        setData(res);
        setLoading(false);
        setError(false);
      })
      .catch((err) => {
        console.log(err);
        setData(null);
        setLoading(false);
        setError(true);
      });

  useEffect(() => {
    mutate();
  }, [key]);

  return { data, loading, error, mutate };
}
