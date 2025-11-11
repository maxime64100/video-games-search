import { useEffect, useMemo, useState } from "react";
import type { Game } from "./gamesHook";

export type SearchFilters = {
  genreSlug?: string;
  platformId?: number;
  minRating?: number;
};

export function useGameSearch(searchTerm: string = "", filters: SearchFilters = {}) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_KEY = "5032cff4417948c7b29bb121fe3a5291";
  const normalizedSearch = searchTerm.trim();
  const filterValues = useMemo(
    () => ({
      genreSlug: filters.genreSlug,
      platformId: filters.platformId,
      minRating: filters.minRating,
    }),
    [filters.genreSlug, filters.platformId, filters.minRating],
  );
  const hasFilters = Boolean(
    filterValues.genreSlug ||
      filterValues.platformId ||
      typeof filterValues.minRating === "number",
  );

  useEffect(() => {
    if (!normalizedSearch && !hasFilters) {
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
        if (filterValues.genreSlug) {
          params.append("genres", filterValues.genreSlug);
        }
        if (filterValues.platformId) {
          params.append("parent_platforms", String(filterValues.platformId));
        }
        const response = await fetch(`https://api.rawg.io/api/games?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        const results = Array.isArray(data?.results) ? data.results : [];
        const filteredResults = typeof filterValues.minRating === "number"
          ? results.filter(
              (game: Game) => typeof game.rating === "number" && game.rating >= filterValues.minRating!,
            )
          : results;
        setGames(filteredResults);
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
  }, [normalizedSearch, filterValues.genreSlug, filterValues.platformId, filterValues.minRating, hasFilters]);

  return { games, isLoading, error };
}
