const express = require('express');
const Panneau = require('../models/panneau');

const router = express.Router();

// 📌 Route pour récupérer les panneaux par catégorie
router.get('/:categorie', async (req, res) => {
    try {
        const { categorie } = req.params;
        const panneaux = await Panneau.find({ categorie });

        if (!panneaux) {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }

        res.json(panneaux);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});
module.exports = router;
