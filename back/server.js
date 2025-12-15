const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Need to install axios in back

const app = express();
const PORT = 4000;
const SECRET_KEY = 'mon_secret_super_securise';
const RAWG_API_KEY = "5032cff4417948c7b29bb121fe3a5291"; // Moved from front

const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- PERSISTENCE UTILS ---
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { users: [], guides: [], favorites: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Helper ID
const generateId = () => Math.floor(Math.random() * 100000); // Simple ID generation

// --- AUTHENTIFICATION ---

app.post('/register', (req, res) => {
  const { email, password, pseudo } = req.body; // Added pseudo for profile
  const db = readDb();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
  }

  const newUser = { 
    id: generateId(), 
    email, 
    password, 
    pseudo: pseudo || email.split('@')[0] // Default pseudo if not provided
  };
  db.users.push(newUser);
  writeDb(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, pseudo: newUser.pseudo }, SECRET_KEY, { expiresIn: '2h' });

  res.status(201).json({ 
    message: 'Compte créé', 
    user: { id: newUser.id, email: newUser.email, pseudo: newUser.pseudo },
    token 
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();

  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, pseudo: user.pseudo }, SECRET_KEY, { expiresIn: '2h' });

  res.json({ 
    message: 'Connexion réussie', 
    user: { id: user.id, email: user.email, pseudo: user.pseudo },
    token
  });
});

app.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

// Middleware Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
    req.user = user; // { id, email, pseudo, iat, exp }
    next();
  });
};

// --- RAWG PROXY ---
// GET /games (List)
app.get('/games', async (req, res) => {
  try {
    // Forward query params (page, search, dates, etc.)
    const params = { ...req.query, key: RAWG_API_KEY };
    const response = await axios.get('https://api.rawg.io/api/games', { params });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la communication avec RAWG" });
  }
});

// GET /games/:id (Details)
app.get('/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.rawg.io/api/games/${id}`, { 
      params: { key: RAWG_API_KEY } 
    });
    // Add parallel fetch for movies or screenshots if needed, but client fetches usually fine if proxied.
    // For now, simpler to just proxy game details. Clients can make separate calls if they need screenshots.
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Jeu introuvable ou erreur RAWG" });
  }
});

// --- FAVORITES (Mockable / User Specific) ---
app.get('/favorites', authenticateToken, (req, res) => {
  const db = readDb();
  const userFavorites = db.favorites.filter(f => f.userId === req.user.id);
  res.json(userFavorites.map(f => f.game));
});

app.post('/favorites', authenticateToken, (req, res) => {
  const game = req.body;
  const db = readDb();
  
  if (db.favorites.find(f => f.userId === req.user.id && f.game.id === game.id)) {
      return res.status(400).json({ error: 'Déjà favori' });
  }

  db.favorites.push({ userId: req.user.id, game });
  writeDb(db);
  res.status(201).json(game);
});

app.delete('/favorites/:id', authenticateToken, (req, res) => {
  const gameId = parseInt(req.params.id);
  const db = readDb();
  
  const initialLen = db.favorites.length;
  // Filter out the ONE item for this user/gameId
  db.favorites = db.favorites.filter(f => !(f.userId === req.user.id && f.game.id === gameId));
  
  if (db.favorites.length !== initialLen) {
      writeDb(db);
  }
  res.json({ message: 'Retiré des favoris' });
});

// --- GUIDES (CRUD) ---
// Model: { id, title, content, gameId, gameName, authorId, authorPseudo, createdAt, updatedAt }

// GET /guides : List all guides (public)
app.get('/guides', (req, res) => {
  const db = readDb();
  // Optional filter by gameId
  const { gameId, authorId } = req.query;
  let guides = db.guides;

  if (gameId) guides = guides.filter(g => g.gameId == gameId);
  if (authorId) guides = guides.filter(g => g.authorId == authorId);

  // Newest first
  guides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(guides);
});

// GET /guides/:id : One guide
app.get('/guides/:id', (req, res) => {
  const db = readDb();
  const guide = db.guides.find(g => g.id == req.params.id);
  if (!guide) return res.status(404).json({ error: 'Guide introuvable' });
  res.json(guide);
});

// POST /guides : Create
app.post('/guides', authenticateToken, (req, res) => {
  const { title, content, gameId, gameName } = req.body;
  
  if (!title || !content || !gameId) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  const db = readDb();
  const newGuide = {
    id: generateId(),
    title,
    content,
    gameId: Number(gameId),
    gameName: gameName || 'Jeu inconnu', // Should be passed from front
    authorId: req.user.id,
    authorPseudo: req.user.pseudo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.guides.push(newGuide);
  writeDb(db);
  res.status(201).json(newGuide);
});

// PUT /guides/:id : Edit (Owner only)
app.put('/guides/:id', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const db = readDb();
  const guideIndex = db.guides.findIndex(g => g.id == req.params.id);

  if (guideIndex === -1) return res.status(404).json({ error: 'Guide introuvable' });
  
  const guide = db.guides[guideIndex];
  if (guide.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  db.guides[guideIndex] = { 
    ...guide, 
    title: title || guide.title, 
    content: content || guide.content,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  res.json(db.guides[guideIndex]);
});

// DELETE /guides/:id : Delete (Owner only)
app.delete('/guides/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const guide = db.guides.find(g => g.id == req.params.id);

  if (!guide) return res.status(404).json({ error: 'Guide introuvable' });
  if (guide.authorId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });

  db.guides = db.guides.filter(g => g.id != req.params.id);
  writeDb(db);
  res.json({ message: 'Guide supprimé' });
});

// --- PUBLIC PROFILE ---
// GET /users/:id/profile
app.get('/users/:id/profile', (req, res) => {
  const db = readDb();
  const userId = Number(req.params.id);
  const user = db.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  // Do NOT send sensitive data like password or email (maybe email is okay if public profile, but stick to pseudo for privacy)
  const publicUser = { id: user.id, pseudo: user.pseudo, email: user.email }; // Added email as requested in "Fiche utilisateur publique" often implies some info
  
  const userGuides = db.guides.filter(g => g.authorId === userId);

  res.json({ ...publicUser, guides: userGuides });
});


app.listen(PORT, () => {
  console.log(`Serveur Backend démarré sur http://localhost:${PORT}`);
});
