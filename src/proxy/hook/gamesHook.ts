import { useEffect, useState } from "react";

export type Game = {
  id: number;
  name: string;
  background_image?: string | null;
  released?: string | null;
  rating?: number | null;
};

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_KEY = "5032cff4417948c7b29bb121fe3a5291";

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}`;
    const lastMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() - 2,
    ).padStart(2, "0")}`;


    const fetchGames = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          key: API_KEY,
          page_size: "40",
          dates: `${lastMonth},${currentMonth}`,
        });

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
  }, []);

  return { games, isLoading, error };
}
