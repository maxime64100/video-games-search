import { useEffect, useState } from "react";
import type { Game } from "./gamesHook";

export function useGameSearch(searchTerm: string = "") {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_KEY = "5032cff4417948c7b29bb121fe3a5291";
  const normalizedSearch = searchTerm.trim();

  useEffect(() => {
    if (!normalizedSearch) {
      setGames([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const fetchGames = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          key: API_KEY,
          page_size: "40",
        });

        if (normalizedSearch) {
          params.append("search", normalizedSearch);
        }

        const response = await fetch(`https://api.rawg.io/api/games?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        const results = Array.isArray(data?.results) ? data.results : [];
        setGames(results);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        if (isActive) {
          setError(message);
          setGames([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchGames();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [normalizedSearch]);

  return { games, isLoading, error };
}
