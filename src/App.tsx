import { BrowserRouter, Link, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Favorites } from './pages/Favorites';
import { GameDetails } from './pages/GameDetails';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { Search } from './pages/Search';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './App.css';

function Navigation() {
  const { favorites } = useFavorites();
  const { isAuthenticated, logout } = useAuth();
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
            to="/recherche"
          >
            Recherche
          </NavLink>

          {isAuthenticated ? (
            <>
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
                to="/parametres"
              >
                Paramètres
              </NavLink>
              <button 
                onClick={logout} 
                className="app-nav__link" 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink
                className="app-nav__link"
                to="/login"
              >
                Connexion
              </NavLink>
              <NavLink
                className="app-nav__link app-nav__link--primary"
                to="/register"
              >
                Inscription
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Chargement...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recherche" element={<Search />} />
              <Route path="/jeux/:id" element={<GameDetails />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/favoris" element={
                <PrivateRoute>
                  <Favorites />
                </PrivateRoute>
              } />
              <Route path="/parametres" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
