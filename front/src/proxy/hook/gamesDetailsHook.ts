import { useEffect, useState } from 'react';

export type GameDetails = {
  id: number;
  name: string;
  description_raw?: string;
  background_image?: string | null;
  website?: string;
  released?: string | null;
  rating?: number | null;
  ratings_count?: number;
  metacritic?: number | null;
  platforms?: Array<{ platform: { id: number; name: string } }>;
  genres?: Array<{ id: number; name: string }>;
  tags?: Array<{ id: number; name: string }>;
  developers?: Array<{ id: number; name: string }>;
  publishers?: Array<{ id: number; name: string }>;
  clip?: {clip: string; preview: string} | null;
};

export type Screenshot = {
  id: number;
  image: string;
};

export type Movie = {
  id: number;
  name: string;
  preview: string;
  video: string; // usually data.480 or data.max
};

export function useGameDetails(id?: number) {
  const [game, setGame] = useState<GameDetails | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    const { signal } = controller;
    let isActive = true;

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call backend proxy for details
        const detailsRes = await fetch(`/api/games/${id}`, { signal });
        
        if (!detailsRes.ok) throw new Error("Impossible de récupérer le jeu");
        const detailsData = await detailsRes.json();
        
        if (isActive) {
          setGame(detailsData);
          // Screenshots/Movies: Backend simplistic proxying doesn't support them yet.
          // Setting empty ensures UI doesn't crash expecting old data.
          setScreenshots([]); 
          setMovies([]); 
        }
      } catch (err: any) {
        if (!signal.aborted && isActive) {
            setError(err.message || "Erreur inconnue");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [id]);

  return { game, screenshots, movies, isLoading, error };
}
