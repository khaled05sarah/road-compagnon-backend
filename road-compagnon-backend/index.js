const express = require('express');
const cors = require('cors');
const portfinder = require('portfinder');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const DEFAULT_PORT = process.env.PORT || 5000;
const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// 🔹 Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => {
        console.error("❌ Erreur de connexion à MongoDB :", err);
        process.exit(1);
    });

// 🔹 Importation des routes
const authRoutes = require('./routes/auth');  // <-- Correction
app.use('/api/auth', authRoutes);
// 🔹 Endpoint principal
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API Road Companion!');
});

// 🔹 Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error("Erreur serveur:", err.stack);
    res.status(500).json({ error: "Une erreur interne s'est produite." });
});

// 🔹 Démarrage du serveur
portfinder.basePort = DEFAULT_PORT;
portfinder.getPort((err, port) => {
    if (err) {
        console.error(`Erreur lors de la détection du port : ${err}`);
        return;
    }
    app.listen(port, () => {
        console.log(`🚀 Serveur en cours d'exécution sur le port ${port}`);
    });
});
