// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');



const courseRoutes = require('./routes/coureRoutes.js');

const app = express();
const port = process.env.PORT || 5000;

// ✅ Middleware
gapp.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// ✅ Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => {
        console.error("❌ Erreur de connexion à MongoDB :", err);
        process.exit(1);
    });

// ✅ Routes
app.use('/api/courses', courseRoutes);

// ✅ Endpoint principal
app.get('/', (req, res) => {
    res.send("Bienvenue sur l'API Road Companion!");
});

// ✅ Gestion des erreurs
app.use((err, req, res, next) => {
    console.error("Erreur serveur:", err.stack);
    res.status(500).json({ error: "Une erreur interne s'est produite." });
});

// ✅ Démarrage du serveur
app.listen(port, () => {
    console.log(`🚀 Serveur en cours d'exécution sur le port ${port}`);
});
