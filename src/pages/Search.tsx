import { type FormEvent, type KeyboardEvent, type MouseEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useGameSearch, type SearchFilters } from '../proxy/hook/gamesSearchHook';
import { useRawgFilters } from '../proxy/hook/rawgFiltersHook';
import type { Game } from '../proxy/hook/gamesHook';
import './Search.css';

export function Search() {
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [minRating, setMinRating] = useState('');
  const { genres, platforms, isLoading: filtersLoading, error: filtersError } = useRawgFilters();
  const filters = useMemo<SearchFilters>(
    () => ({
      genreSlug: selectedGenre || undefined,
      platformId: selectedPlatform ? Number(selectedPlatform) : undefined,
      minRating:
        minRating && !Number.isNaN(Number(minRating))
          ? Math.min(Math.max(Number(minRating), 0), 5)
          : undefined,
    }),
    [selectedGenre, selectedPlatform, minRating],
  );
  const { games, isLoading, error } = useGameSearch(query, filters);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  const hasActiveFilters = Boolean(selectedGenre || selectedPlatform || minRating);
  const hasSearchContext = Boolean(query || hasActiveFilters);

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

  const handleResetFilters = () => {
    setSelectedGenre('');
    setSelectedPlatform('');
    setMinRating('');
  };

  const handleMinRatingChange = (value: string) => {
    const normalized = value.replace(',', '.');
    setMinRating(normalized);
  };

  const handleMinRatingBlur = () => {
    if (!minRating.trim()) {
      return;
    }
    const numeric = Number(minRating);
    if (Number.isNaN(numeric)) {
      setMinRating('');
      return;
    }
    const clamped = Math.min(Math.max(numeric, 0), 5);
    const rounded = Math.round(clamped * 10) / 10;
    setMinRating(Number(rounded.toFixed(1)).toString());
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

      <section className="search__filters" aria-live="polite">
        <div className="search__filters-grid">
          <label className="search__label" htmlFor="genre-filter">
            Type de jeu
            <select
              id="genre-filter"
              className="search__select"
              value={selectedGenre}
              disabled={filtersLoading || genres.length === 0}
              onChange={(event) => setSelectedGenre(event.target.value)}
            >
              <option value="">Tous les genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.slug ?? genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>

          <label className="search__label" htmlFor="platform-filter">
            Plateforme
            <select
              id="platform-filter"
              className="search__select"
              value={selectedPlatform}
              disabled={filtersLoading || platforms.length === 0}
              onChange={(event) => setSelectedPlatform(event.target.value)}
            >
              <option value="">Toutes les plateformes</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </label>

          <label className="search__label" htmlFor="rating-filter">
            Note minimale
            <div className="search__number-wrapper">
              <input
                id="rating-filter"
                className="search__number-input"
                type="number"
                min="0"
                max="5"
                step="0.1"
                inputMode="decimal"
                placeholder="ex : 4.2"
                value={minRating}
                onChange={(event) => handleMinRatingChange(event.target.value)}
                onBlur={handleMinRatingBlur}
                aria-label="Filtrer par note minimale"
              />
              <span className="search__input-hint">Valeur comprise entre 0 et 5 (précision 0,1).</span>
            </div>
          </label>
        </div>

        <div className="search__filters-footer">
          {filtersLoading && (
            <p className="search__filters-status">Chargement des filtres…</p>
          )}
          {filtersError && (
            <p className="search__filters-status search__filters-status--error">
              Impossible de charger les filtres : {filtersError}
            </p>
          )}
          {hasActiveFilters && (
            <button className="search__filters-reset" type="button" onClick={handleResetFilters}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </section>

      {error && <p className="search__status search__status--error">Erreur : {error}</p>}
      {isLoading && <p className="search__status">Recherche en cours…</p>}
      {hasSearchContext && !isLoading && !error && games.length === 0 && (
        <p className="search__empty">
          {query
            ? `Aucun jeu trouvé pour « ${query} ».`
            : 'Aucun jeu ne correspond aux filtres sélectionnés.'}
        </p>
      )}

      {hasSearchContext && games.length > 0 && (
        <div className="search__results">
          <h2 className="search__results-title">
            {query ? `Résultats pour « ${query} »` : 'Résultats par filtres'}
          </h2>
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
