import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { Favorites } from './pages/Favorites';
import { GameDetails } from './pages/GameDetails';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
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
          <NavLink
            className={({ isActive }) =>
              `app-nav__link app-nav__link--pill ${
                isActive ? 'app-nav__link--active' : ''
              }`
            }
            to="/parametres"
          >
            Paramètres
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favoris" element={<Favorites />} />
            <Route path="/jeux/:id" element={<GameDetails />} />
            <Route path="/recherche" element={<Search />} />
            <Route path="/parametres" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
