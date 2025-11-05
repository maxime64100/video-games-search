import { useEffect, useState } from "react";

type Game = {
  id: number;
  name: string;
  background_image?: string | null;
  released?: string | null;
  rating?: number | null;
};

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const API_KEY = "5032cff4417948c7b29bb121fe3a5291";

  useEffect(() => {
    const fetchGames = async () => {
      const response = await fetch(`https://api.rawg.io/api/games?key=${API_KEY}&page_size=40`);
      const data = await response.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      setGames(results);
    };

    fetchGames();
  }, []);

  return { games };
}
