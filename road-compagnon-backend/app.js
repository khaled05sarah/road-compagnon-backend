require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const User = require('./models/User'); // Import du modèle utilisateur
const panneauxRoutes = require('./routes/panneauxRoutes');
const  authRoutes=require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Middleware pour parser le JSON et gérer CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Permet de lire les formulaires
app.use(cors());

// ✅ Middleware pour logger les requêtes (utile pour le debug)
app.use((req, res, next) => {
    console.log(`📩 [${req.method}] ${req.url} - Body:`, req.body);
    next();
});

// ✅ Connexion à MongoDB (sans options `useNewUrlParser` et `useUnifiedTopology`)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/monprojetdb';

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connexion à MongoDB réussie !"))
    .catch(err => console.error("❌ Erreur de connexion à MongoDB :", err));

// ✅ Route de test pour voir si le serveur tourne
app.get('/', (req, res) => {
    res.send('🚀 Serveur Express opérationnel !');
});

// ✅ Routes d'authentification
app.use('/api/auth', authRoutes);

// ✅ Route pour récupérer tous les utilisateurs (test uniquement)
app.get('/users', async(req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '❌ Erreur lors de la récupération des utilisateurs', error: error.message });
    }
});

// ✅ Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ message: '❌ Une erreur interne est survenue.' });
});

app.use('/api/panneaux', panneauxRoutes);

// ✅ Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});