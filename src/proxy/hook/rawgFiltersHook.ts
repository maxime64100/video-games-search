import { useEffect, useState } from "react";

type FilterOption = {
  id: number;
  name: string;
  slug?: string;
};

type UseRawgFiltersResult = {
  genres: FilterOption[];
  platforms: FilterOption[];
  isLoading: boolean;
  error: string | null;
};

export function useRawgFilters(): UseRawgFiltersResult {
  const [genres, setGenres] = useState<FilterOption[]>([]);
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_KEY = "5032cff4417948c7b29bb121fe3a5291";

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchFilters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [genresResponse, platformsResponse] = await Promise.all([
          fetch(`https://api.rawg.io/api/genres?key=${API_KEY}`, { signal }),
          fetch(`https://api.rawg.io/api/platforms/lists/parents?key=${API_KEY}`, { signal }),
        ]);

        if (!genresResponse.ok) {
          throw new Error(`Erreur ${genresResponse.status}`);
        }
        if (!platformsResponse.ok) {
          throw new Error(`Erreur ${platformsResponse.status}`);
        }

        const genresData = await genresResponse.json();
        const platformsData = await platformsResponse.json();

        const formattedGenres: FilterOption[] = Array.isArray(genresData?.results)
          ? genresData.results
              .filter((genre: any) => typeof genre?.id === "number" && typeof genre?.name === "string")
              .map((genre: any) => ({ id: genre.id, name: genre.name, slug: genre.slug }))
          : [];

        const formattedPlatforms: FilterOption[] = Array.isArray(platformsData?.results)
          ? platformsData.results
              .filter((platform: any) => typeof platform?.id === "number" && typeof platform?.name === "string")
              .map((platform: any) => ({ id: platform.id, name: platform.name, slug: platform.slug }))
          : [];

        if (!signal.aborted) {
          setGenres(formattedGenres);
          setPlatforms(formattedPlatforms);
        }
      } catch (err) {
        if (signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setGenres([]);
        setPlatforms([]);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFilters();

    return () => {
      controller.abort();
    };
  }, [API_KEY]);

  return { genres, platforms, isLoading, error };
}
