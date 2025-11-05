import { useEffect, useState } from 'react';

type GameDetails = {
  id: number;
  name: string;
  description_raw?: string;
  background_image?: string;
  released?: string;
  metacritic?: number;
  rating?: number;
  ratings_count?: number;
  genres?: Array<{ id: number; name: string }>;
  platforms?: Array<{ platform: { id: number; name: string } }>;
  developers?: Array<{ id: number; name: string }>;
  publishers?: Array<{ id: number; name: string }>;
  website?: string;
  tags?: Array<{ id: number; name: string }>;
};

export function useGameDetails(id: number | undefined) {
  const [game, setGame] = useState<GameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_KEY = "5032cff4417948c7b29bb121fe3a5291";

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchGameDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setGame(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  return { game, isLoading, error };
}
