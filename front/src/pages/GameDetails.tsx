import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useGameDetails } from '../proxy/hook/gamesDetailsHook';
import './GameDetails.css';

export function GameDetails() {
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;
  const { game, screenshots, movies, isLoading, error } = useGameDetails(numericId);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    if (screenshots.length > 0) {
      setActiveScreenshot(0);
    }
  }, [screenshots.length]);

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
  const hasScreenshots = screenshots.length > 0;
  const currentScreenshot =
    hasScreenshots && screenshots[activeScreenshot]
      ? screenshots[activeScreenshot]
      : null;
  const primaryMovie =
    movies.find((m) => m.video) ??
    movies.find((m) => m.preview) ??
    null;
  const videoSource = primaryMovie?.video ?? game.clip?.clip ?? null;
  const videoPoster =
    primaryMovie?.preview ??
    game.clip?.preview ??
    currentScreenshot?.image ??
    game.background_image;
  const hasVideo = Boolean(videoSource);

  const handlePrevScreenshot = () => {
    setActiveScreenshot((index) => Math.max(index - 1, 0));
  };

  const handleNextScreenshot = () => {
    setActiveScreenshot((index) => Math.min(index + 1, screenshots.length - 1));
  };

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
        <div className="absolute bottom-6 right-6">
            <Link 
                to={`/guides/new?gameId=${game.id}&gameName=${encodeURIComponent(game.name)}`} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-lg transition"
            >
                ✍️ Rédiger un guide
            </Link>
        </div>
      </div>

      <div className="game-details__body">
        {(hasVideo || hasScreenshots) && (
          <div className="mt-10 grid gap-8">
            {hasVideo && (
              <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur-md transition">
                <h2 className="text-xl font-semibold tracking-tight text-white">Bande-annonce</h2>
                <div className="relative mt-4 overflow-hidden rounded-2xl bg-black/60 shadow-lg">
                  <video
                    className="h-full w-full object-cover"
                    controls
                    poster={videoPoster ?? undefined}
                    src={videoSource ?? undefined}
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
              </article>
            )}

            {hasScreenshots && currentScreenshot && (
              <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur-md transition">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold tracking-tight text-white">Galerie</h2>
                  <div className="flex items-center gap-3">
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white transition hover:-translate-y-0.5 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      type="button"
                      onClick={handlePrevScreenshot}
                      disabled={activeScreenshot === 0}
                      aria-label="Capture précédente"
                    >
                      ‹
                    </button>
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                      {activeScreenshot + 1}/{screenshots.length}
                    </span>
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white transition hover:-translate-y-0.5 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      type="button"
                      onClick={handleNextScreenshot}
                      disabled={activeScreenshot === screenshots.length - 1}
                      aria-label="Capture suivante"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="relative mt-6 overflow-hidden rounded-2xl bg-black/60 shadow-lg">
                  <img
                    className="h-full w-full max-h-[570px] object-cover"
                    src={currentScreenshot.image}
                    alt={`Capture ${activeScreenshot + 1} de ${game.name}`}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {screenshots.map((shot, index) => (
                        <button
                        key={shot.id}
                        type="button"
                        onClick={() => setActiveScreenshot(index)}
                        aria-label={`Afficher la capture ${index + 1}`}
                        className={`group relative overflow-hidden rounded-xl bg-transparent transition duration-200
                            ${index === activeScreenshot
                            ? 'scale-[1.04]'
                            : 'hover:scale-[1.02]'
                            }
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                        >
                        <img
                            src={shot.image}
                            alt={`Vignette ${index + 1} de ${game.name}`}
                            className="block h-20 w-full object-cover transition duration-200 group-hover:scale-105"
                        />
                        {/* Overlay discret au survol + actif (pas un ring) */}
                        <span
                            className={`pointer-events-none absolute inset-0 transition-opacity duration-200
                            ${index === activeScreenshot ? 'bg-indigo-500/25 opacity-100' : 'bg-indigo-500/15 opacity-0 group-hover:opacity-100'}`}
                        />
                        </button>
                    ))}
                </div>

              </article>
            )}
          </div>
        )}

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
