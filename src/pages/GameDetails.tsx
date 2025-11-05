import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useGameDetails } from '../proxy/hook/gamesDetailsHook';
import './GameDetails.css';

export function GameDetails() {
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;
  const { game, isLoading, error } = useGameDetails(numericId);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const platformList = useMemo(
    () =>
      game?.platforms
        ?.map((entry) => entry.platform?.name)
        .filter(Boolean)
        .join(', ') ?? '–',
    [game?.platforms],
  );
  const genreList = useMemo(
    () => game?.genres?.map((genre) => genre.name).join(', ') ?? '–',
    [game?.genres],
  );
  const developerList = useMemo(
    () => game?.developers?.map((dev) => dev.name).join(', ') ?? '–',
    [game?.developers],
  );
  const publisherList = useMemo(
    () => game?.publishers?.map((publisher) => publisher.name).join(', ') ?? '–',
    [game?.publishers],
  );
  const releaseDate = useMemo(() => {
    if (!game?.released) {
      return '–';
    }
    return new Date(game.released).toLocaleDateString();
  }, [game?.released]);
  if (!numericId) {
    return (
      <section className="game-details">
        <div className="game-details__status">Aucun identifiant de jeu fourni.</div>
      </section>
    );
  }
  if (isLoading) {
    return (
      <section className="game-details">
        <div className="game-details__status">Chargement des détails du jeu...</div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="game-details">
        <div className="game-details__status">Impossible de récupérer le jeu : {error}</div>
      </section>
    );
  }
  if (!game) {
    return (
      <section className="game-details">
        <div className="game-details__status">Jeu introuvable.</div>
      </section>
    );
  }

  const favoriteActive = isFavorite(game.id);

  return (
    <section className="game-details">
      <div
        className={`game-details__hero ${game.background_image ? 'game-details__hero--image' : ''}`}
        style={
          game.background_image
            ? { backgroundImage: `linear-gradient(135deg, rgba(103,75,219,0.65), rgba(32,193,236,0.4)), url(${game.background_image})` }
            : undefined
        }
      >
        <div className="game-details__overlay" />
        <div className="game-details__hero-content">
          <span className="game-details__badge">ID #{game.id}</span>
          <h1 className="game-details__title">{game.name}</h1>
          <p className="game-details__subtitle">{game.description_raw?.slice(0, 180) ?? 'Découvrez toutes les informations essentielles sur ce jeu.'}</p>
          <div className="game-details__stats">
            <span className="game-details__stat">
              Note&nbsp;: <strong>{game.rating ? game.rating.toFixed(1) : '–'}</strong>
            </span>
            <span className="game-details__stat">
              Avis&nbsp;: <strong>{game.ratings_count ?? '–'}</strong>
            </span>
            <span className="game-details__stat">
              Metacritic&nbsp;: <strong>{game.metacritic ?? '–'}</strong>
            </span>
          </div>
          <button
            className={`game-details__favorite ${favoriteActive ? 'game-details__favorite--active' : ''}`}
            type="button"
            aria-pressed={favoriteActive}
            aria-label={
              favoriteActive
                ? `Retirer ${game.name} des favoris`
                : `Ajouter ${game.name} aux favoris`
            }
            onClick={() =>
              favoriteActive
                ? removeFavorite(game.id)
                : addFavorite({
                    id: game.id,
                    name: game.name,
                    background_image: game.background_image,
                    released: game.released,
                    rating: game.rating,
                  })
            }
          >
            {favoriteActive ? '★' : '☆'}
          </button>
        </div>
      </div>

      <div className="game-details__body">
        <div className="game-details__grid">
          <article className="game-details__card">
            <h2 className="game-details__card-title">Présentation</h2>
            <p className="game-details__text">
              {game.description_raw ?? 'La description du jeu est momentanément indisponible.'}
            </p>
          </article>

          <article className="game-details__card">
            <h2 className="game-details__card-title">Informations clés</h2>
            <ul className="game-details__meta">
              <li className="game-details__meta-item">
                <span className="game-details__meta-label">Plateformes :</span>
                <span className="game-details__meta-value">{platformList}</span>
              </li>
              <li className="game-details__meta-item">
                <span className="game-details__meta-label">Genre :</span>
                <span className="game-details__meta-value">{genreList}</span>
              </li>
              <li className="game-details__meta-item">
                <span className="game-details__meta-label">Sortie :</span>
                <span className="game-details__meta-value">{releaseDate}</span>
              </li>
              <li className="game-details__meta-item">
                <span className="game-details__meta-label">Développeurs :</span>
                <span className="game-details__meta-value">{developerList}</span>
              </li>
              <li className="game-details__meta-item">
                <span className="game-details__meta-label">Éditeurs :</span>
                <span className="game-details__meta-value">{publisherList}</span>
              </li>
            </ul>
          </article>

          <article className="game-details__card game-details__card--highlight">
            <h2 className="game-details__card-title">Tags populaires</h2>
            {game.tags && game.tags.length > 0 ? (
              <div className="game-details__chips">
                {game.tags.slice(0, 10).map((tag) => (
                  <span className="game-details__chip" key={tag.id}>
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="game-details__text">Aucun tag disponible pour ce jeu.</p>
            )}
            {game.website ? (
              <a
                className="game-details__cta"
                href={game.website}
                target="_blank"
                rel="noreferrer"
              >
                Visiter le site officiel
              </a>
            ) : (
              <button className="game-details__cta game-details__cta--disabled" type="button" disabled>
                Site officiel indisponible
              </button>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
