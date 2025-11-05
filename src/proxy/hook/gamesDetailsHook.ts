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
  clip?: {
    clip?: string;
    preview?: string;
  };
};

type Screenshot = {
  id: number;
  image: string;
};

type Movie = {
  id: number;
  preview?: string;
  video?: string;
};

type UseGameDetailsResult = {
  game: GameDetails | null;
  screenshots: Screenshot[];
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
};


export function useGameDetails(id: number | undefined): UseGameDetailsResult {
  const [game, setGame] = useState<GameDetails | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_KEY = "5032cff4417948c7b29bb121fe3a5291";

  useEffect(() => {
    if (!id) {
      setGame(null);
      setScreenshots([]);
      setMovies([]);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchGameDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detailsResponse, screenshotsResponse, moviesResponse] = await Promise.all([
          fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`, { signal }),
          fetch(`https://api.rawg.io/api/games/${id}/screenshots?key=${API_KEY}`, { signal }),
          fetch(`https://api.rawg.io/api/games/${id}/movies?key=${API_KEY}`, { signal }),
        ]);

        if (!detailsResponse.ok) {
          throw new Error(`Erreur ${detailsResponse.status}`);
        }
        if (!screenshotsResponse.ok) {
          throw new Error(`Erreur ${screenshotsResponse.status}`);
        }
        if (!moviesResponse.ok) {
          throw new Error(`Erreur ${moviesResponse.status}`);
        }

        const detailsData = await detailsResponse.json();
        const screenshotsData = await screenshotsResponse.json();
        const moviesData = await moviesResponse.json();

        if (!signal.aborted) {
          setGame(detailsData);
          const formattedScreenshots: Screenshot[] = Array.isArray(screenshotsData?.results)
            ? screenshotsData.results
                .filter((shot: any) => typeof shot?.image === 'string')
                .map((shot: any) => ({ id: shot.id, image: shot.image }))
            : [];
          setScreenshots(formattedScreenshots);
          const formattedMovies = Array.isArray(moviesData?.results)
            ? moviesData.results
                .map((movie: any) => {
                  const videoSrc =
                    typeof movie?.data?.max === 'string'
                      ? movie.data.max
                      : typeof movie?.data?.['480'] === 'string'
                        ? movie.data['480']
                        : undefined;
                  return {
                    id: movie.id,
                    preview: typeof movie?.preview === 'string' ? movie.preview : undefined,
                    video: videoSrc,
                  };
                })
                .filter((movie: Movie) => movie.preview || movie.video)
            : [];
          setMovies(formattedMovies);
        }

      } catch (err) {
        if (signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setGame(null);
        setScreenshots([]);
        setMovies([]);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchGameDetails();

    return () => {
      controller.abort();
    };
  }, [id, API_KEY]);

  return { game, screenshots, movies, isLoading, error };
}
