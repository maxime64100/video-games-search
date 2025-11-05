import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import './App.css'

function App() {

  return (
    <>
     <BrowserRouter>
      <nav>
        <Link to="/">Accueil</Link> 
        <Link to="/favoris">Favoris</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favoris" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
