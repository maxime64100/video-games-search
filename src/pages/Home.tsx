import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGames } from '../proxy/hook/gamesHook';
import './Home.css';

export function Home() {
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const { games, isLoading, error } = useGames(query);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(searchValue.trim());
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
        {games.map((game) => (
          <article className="game-card" key={game.id}>
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
              <Link to={`/jeux/${game.id}`}>Voir les détails</Link>
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
        ))}
      </div>
    </div>
  );
}
