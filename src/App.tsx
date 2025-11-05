import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { Favorites } from './pages/Favorites';
import { GameDetails } from './pages/GameDetails';
import { Home } from './pages/Home';
import './App.css';

function App() {

  return (
    <>
     <FavoritesProvider>
      <BrowserRouter>
        <nav>
          <Link to="/">Accueil</Link> 
          <Link to="/favoris">Favoris</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favoris" element={<Favorites />} />
          <Route path="/jeux/:id" element={<GameDetails />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
    </>
  )
}

export default App
