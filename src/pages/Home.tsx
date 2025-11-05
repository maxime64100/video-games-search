import { type FormEvent, type KeyboardEvent, type MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useGames } from '../proxy/hook/gamesHook';
import './Home.css';

export function Home() {
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const { games, isLoading, error } = useGames(query);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(searchValue.trim());
  };

  const handleCardActivate = (gameId: number) => {
    navigate(`/jeux/${gameId}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, gameId: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardActivate(gameId);
    }
  };

  const toggleFavorite = (
    event: MouseEvent<HTMLButtonElement>,
    game: {
      id: number;
      name: string;
      background_image?: string | null;
      released?: string | null;
      rating?: number | null;
    },
  ) => {
    event.stopPropagation();
    const favoriteActive = isFavorite(game.id);
    if (favoriteActive) {
      removeFavorite(game.id);
    } else {
      addFavorite(game);
    }
  };

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">Accueil</h1>
        <p className="home__description">
          Bienvenue sur la page d'accueil qui permet de rechercher des jeux vidéos !
        </p>
      </header>

      <form className="home__search" onSubmit={handleSearch}>
        <input
          className="home__search-input"
          type="text"
          placeholder="Rechercher un jeu vidéo..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <button className="home__search-button" type="submit">
          Rechercher
        </button>
      </form>

      {error && <p className="home__status home__status--error">Erreur : {error}</p>}
      {isLoading && <p className="home__status">Chargement des jeux en cours…</p>}
      {!isLoading && !error && games.length === 0 && (
        <p className="home__empty">
          {query ? `Aucun jeu trouvé pour « ${query} ».` : "Aucun jeu disponible pour le moment."}
        </p>
      )}

      <div className="home__grid">
        {games.map((game) => {
          const favoriteActive = isFavorite(game.id);

          return (
            <article
              className="game-card"
              key={game.id}
              tabIndex={0}
              role="button"
              onClick={() => handleCardActivate(game.id)}
              onKeyDown={(event) => handleCardKeyDown(event, game.id)}
              aria-label={`Voir les détails de ${game.name}`}
            >
              <button
                className={`game-card__favorite ${favoriteActive ? 'game-card__favorite--active' : ''}`}
                type="button"
                aria-pressed={favoriteActive}
                aria-label={
                  favoriteActive
                    ? `Retirer ${game.name} des favoris`
                    : `Ajouter ${game.name} aux favoris`
                }
                onClick={(event) => toggleFavorite(event, game)}
              >
                {favoriteActive ? '★' : '☆'}
              </button>
              {game.background_image ? (
                <img
                  className="game-card__image"
                  src={game.background_image}
                  alt={`Illustration du jeu ${game.name}`}
                  loading="lazy"
                />
              ) : (
                <div className="game-card__placeholder">Image indisponible</div>
              )}
              <div className="game-card__body">
                <h2 className="game-card__title">{game.name}</h2>
                {game.released && (
                  <p className="game-card__meta">
                    Sortie&nbsp;: <span>{new Date(game.released).toLocaleDateString()}</span>
                  </p>
                )}
                {typeof game.rating === 'number' && (
                  <p className="game-card__meta">
                    Note&nbsp;: <span>{game.rating.toFixed(1)}/5</span>
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
