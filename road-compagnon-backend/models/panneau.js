const mongoose = require('mongoose');

const panneauSchema = new mongoose.Schema({
    categorie: { type: String, required: true },
    exemples: [
        {
            nom: { type: String, required: true },
            description: { type: String, required: true },
            image_url: { type: String } // Optionnel pour stocker l'image
        }
    ]
});

module.exports = mongoose.model('Panneau', panneauSchema);
