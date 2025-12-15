const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET_KEY = "mon_secret_super_securise"; 

app.use(cors());
app.use(bodyParser.json());

let users = []; 
let favorites = []; 

const generateId = () => Math.floor(Math.random() * 10000);

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Cet utilisateur existe déjà" });
  }

  const newUser = { id: generateId(), email, password };
  users.push(newUser);

  // Auto-login après register
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.status(201).json({
    message: "Utilisateur créé",
    user: { id: newUser.id, email: newUser.email },
    token,
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.json({
    message: "Login réussi",
    user: { id: user.id, email: user.email },
    token,
  });
});

app.post("/logout", (req, res) => {
  res.json({ message: "Déconnexion réussie" });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Accès non autorisé" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user;
    next();
  });
};

app.get("/favorites", authenticateToken, (req, res) => {
  const userFavorites = favorites.filter((fav) => fav.userId === req.user.id);
  res.json(userFavorites.map((f) => f.game));
});

app.post("/favorites", authenticateToken, (req, res) => {
  const game = req.body;
  if (!game || !game.id) {
    return res.status(400).json({ error: "Données de jeu invalides" });
  }


  const exists = favorites.find(
    (f) => f.userId === req.user.id && f.game.id === game.id
  );
  if (exists) {
    return res.status(400).json({ error: "Jeu déjà dans les favoris" });
  }

  const newFavorite = { userId: req.user.id, game };
  favorites.push(newFavorite);

  res.status(201).json(game);
});

app.delete("/favorites/:id", authenticateToken, (req, res) => {
  const gameId = parseInt(req.params.id);
  const initialLength = favorites.length;

  favorites = favorites.filter(
    (f) => !(f.userId === req.user.id && f.game.id === gameId)
  );

  if (favorites.length === initialLength) {
  }

  res.status(200).json({ message: "Favori retiré" });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
