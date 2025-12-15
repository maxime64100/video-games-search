import { type KeyboardEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import './Favorites.css';

export function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleCardActivate = (gameId: number) => {
    navigate(`/jeux/${gameId}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, gameId: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardActivate(gameId);
    }
  };

  const handleRemove = (event: MouseEvent<HTMLButtonElement>, gameId: number) => {
    event.stopPropagation();
    removeFavorite(gameId);
  };

  return (
    <section className="favorites">
      <header className="favorites__header">
        <h1 className="favorites__title">Favoris</h1>
        <p className="favorites__subtitle">
          Votre sélection de jeux vidéo préférés, prêts à être découverts à nouveau.
        </p>
      </header>

      {favorites.length === 0 ? (
        <p className="favorites__empty">Vous n&apos;avez pas encore ajouté de jeu en favoris.</p>
      ) : (
        <div className="favorites__grid">
          {favorites.map((game) => (
            <article
              className="favorites-card"
              key={game.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCardActivate(game.id)}
              onKeyDown={(event) => handleCardKeyDown(event, game.id)}
              aria-label={`Voir les détails de ${game.name}`}
            >
              <button
                className="favorites-card__favorite"
                type="button"
                aria-label={`Retirer ${game.name} des favoris`}
                onClick={(event) => handleRemove(event, game.id)}
              >
                ★
              </button>
              {game.background_image ? (
                <img
                  className="favorites-card__image"
                  src={game.background_image}
                  alt={`Illustration du jeu ${game.name}`}
                  loading="lazy"
                />
              ) : (
                <div className="favorites-card__placeholder">Image indisponible</div>
              )}
              <div className="favorites-card__body">
                <h2 className="favorites-card__title">{game.name}</h2>
                {game.released && (
                  <p className="favorites-card__meta">
                    Sortie&nbsp;: <span>{new Date(game.released).toLocaleDateString()}</span>
                  </p>
                )}
                {typeof game.rating === 'number' && (
                  <p className="favorites-card__meta">
                    Note&nbsp;: <span>{game.rating.toFixed(1)}/5</span>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
