import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export type FavoriteGame = {
  id: number;
  name: string;
  background_image?: string | null;
  released?: string | null;
  rating?: number | null;
};

type FavoritesContextValue = {
  favorites: FavoriteGame[];
  addFavorite: (game: FavoriteGame) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  isLoading: boolean;
  error: string | null;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les favoris depuis le backend
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get('/favorites');
        setFavorites(res.data);
      } catch (err) {
        console.error('Erreur chargement favoris', err);
        setError("Impossible de charger les favoris.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  const addFavorite = useCallback(async (game: FavoriteGame) => {
    // Optimistic update impossible easily without ID from backend if creation generates ID,
    // but here game has ID. We could do optimistic.
    // For safety, let's just call API then update state.

    try {
      await api.post('/favorites', game);
      setFavorites((prev) => [...prev, game]);
    } catch (err) {
      console.error("Erreur ajout favori", err);
      // Gérer l'erreur (toast, alert...)
      setError("Erreur lors de l'ajout aux favoris.");
    }
  }, []);

  const removeFavorite = useCallback(async (id: number) => {
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Erreur suppression favori", err);
      setError("Erreur lors de la suppression des favoris.");
    }
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some((item) => item.id === id),
    [favorites],
  );

  const value = useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      isLoading,
      error
    }),
    [favorites, addFavorite, removeFavorite, isFavorite, isLoading, error],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
