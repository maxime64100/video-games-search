import { type FormEvent, type KeyboardEvent, type MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useGameSearch } from '../proxy/hook/gamesSearchHook';
import type { Game } from '../proxy/hook/gamesHook';
import './Search.css';

export function Search() {
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const { games, isLoading, error } = useGameSearch(query);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>, game: Game) => {
    event.stopPropagation();
    const active = isFavorite(game.id);
    if (active) {
      removeFavorite(game.id);
    } else {
      addFavorite(game);
    }
  };

  return (
    <div className="search">
      <header className="search__header">
        <h1 className="search__title">Recherche</h1>
        <p className="search__description">
          Tape le nom d&apos;un jeu pour afficher les résultats correspondants.
        </p>
      </header>

      <form className="search__form" onSubmit={handleSubmit}>
        <input
          className="search__input"
          type="text"
          placeholder="Rechercher un jeu vidéo..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <button className="search__button" type="submit" disabled={!searchValue.trim()}>
          Rechercher
        </button>
      </form>

      {error && <p className="search__status search__status--error">Erreur : {error}</p>}
      {isLoading && <p className="search__status">Recherche en cours…</p>}
      {query && !isLoading && !error && games.length === 0 && (
        <p className="search__empty">Aucun jeu trouvé pour « {query} ».</p>
      )}

      {query && games.length > 0 && (
        <div className="search__results">
          <h2 className="search__results-title">Résultats pour « {query} »</h2>
          <div className="search__grid">
            {games.map((game) => {
              const active = isFavorite(game.id);
              return (
                <article
                  className="game-card"
                  key={game.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardActivate(game.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, game.id)}
                  aria-label={`Voir les détails de ${game.name}`}
                >
                  <button
                    className={`game-card__favorite ${active ? 'game-card__favorite--active' : ''}`}
                    type="button"
                    aria-pressed={active}
                    aria-label={
                      active
                        ? `Retirer ${game.name} des favoris`
                        : `Ajouter ${game.name} aux favoris`
                    }
                    onClick={(event) => toggleFavorite(event, game)}
                  >
                    {active ? '★' : '☆'}
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
                    <h3 className="game-card__title">{game.name}</h3>
                    {game.released && (
                      <p className="game-card__meta">
                        Sortie&nbsp;:{' '}
                        <span>{new Date(game.released).toLocaleDateString()}</span>
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
      )}
    </div>
  );
}
