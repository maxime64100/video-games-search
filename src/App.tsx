import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { Favorites } from './pages/Favorites';
import { GameDetails } from './pages/GameDetails';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import './App.css';

function Navigation() {
  const { favorites } = useFavorites();
  const favoritesCount = favorites.length;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="app-header__brand" to="/">
          <span className="app-header__logo">🎮</span>
          <span className="app-header__title">GameScope</span>
        </Link>

        <nav className="app-nav">
          <NavLink
            className={({ isActive }) =>
              `app-nav__link ${isActive ? 'app-nav__link--active' : ''}`
            }
            to="/"
          >
            Accueil
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `app-nav__link app-nav__link--pill ${
                isActive ? 'app-nav__link--active' : ''
              }`
            }
            to="/favoris"
          >
            Favoris
            {favoritesCount > 0 && (
              <span className="app-nav__badge">{favoritesCount}</span>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `app-nav__link app-nav__link--pill ${
                isActive ? 'app-nav__link--active' : ''
              }`
            }
            to="/recherche"
          >
            Recherche
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favoris" element={<Favorites />} />
          <Route path="/jeux/:id" element={<GameDetails />} />
          <Route path="/recherche" element={<Search />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  );
}

export default App;
