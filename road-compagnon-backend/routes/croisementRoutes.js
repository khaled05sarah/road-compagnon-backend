const express = require('express');
const router = express.Router();
const Croisement = require('../models/croisement');

// Route pour récupérer l'explication générale du croisement
router.get('/explication_generale', async(req, res) => {
    try {
        const croisement = await Croisement.findOne(); // Récupérer le premier croisement

        if (!croisement) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json({ explication_generale: croisement.explication_generale });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour récupérer tous les paragraphes du croisement
router.get('/paragraphes', async(req, res) => {
    try {
        const croisement = await Croisement.findOne();

        if (!croisement) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json(croisement.paragraphes);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour récupérer un paragraphe spécifique avec un index dynamique
router.get('/paragraphes/:index', async(req, res) => {
    const { index } = req.params;
    const indexNum = Number(index);

    if (!Number.isInteger(indexNum) || indexNum < 0) {
        return res.status(400).json({ message: 'Index invalide' });
    }

    try {
        const croisement = await Croisement.findOne();
        if (!croisement) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        if (indexNum >= croisement.paragraphes.length) {
            return res.status(404).json({ message: 'Index hors limites' });
        }

        res.json(croisement.paragraphes[indexNum]);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;