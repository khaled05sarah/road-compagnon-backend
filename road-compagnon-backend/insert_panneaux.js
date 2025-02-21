require('dotenv').config();
const mongoose = require('mongoose');
const Panneau = require('./models/panneau');

// 📌 Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion :", err));

// 📌 Données complètes des panneaux
const panneaux = [
    {
        categorie: "danger",
        exemples: [
            { nom: "Virage à gauche", description: "Virage dangereux à gauche.", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/France_road_sign_A1b.svg/375px-France_road_sign_A1b.svg.png" },
            { nom: "Virage à droite", description: "Virage dangereux à droite.", image_url: "https://example.com/danger2.jpg" },
            { nom: "Succession de virages", description: "Virages successifs.", image_url: "https://example.com/danger3.jpg" },
            { nom: "Descente dangereuse", description: "Pente importante.", image_url: "https://example.com/danger4.jpg" },
            { nom: "Montée abrupte", description: "Montée très inclinée.", image_url: "https://example.com/danger5.jpg" },
            { nom: "Route glissante", description: "Chaussée potentiellement glissante.", image_url: "https://example.com/danger6.jpg" },
            { nom: "Chaussée rétrécie", description: "Réduction de la largeur de la route.", image_url: "https://example.com/danger7.jpg" },
            { nom: "Présence de piétons", description: "Zone fréquentée par des piétons.", image_url: "https://example.com/danger8.jpg" },
            { nom: "Passage d’animaux", description: "Traversée possible d’animaux sauvages.", image_url: "https://example.com/danger9.jpg" },
            { nom: "Travaux", description: "Chantier en cours sur la route.", image_url: "https://example.com/danger10.jpg" },
            { nom: "Risque d’éboulement", description: "Chutes de pierres possibles.", image_url: "https://example.com/danger11.jpg" },
            { nom: "Pont mobile", description: "Présence d’un pont pouvant s’ouvrir.", image_url: "https://example.com/danger12.jpg" },
            { nom: "Passage à niveau sans barrière", description: "Croisement avec voie ferrée sans protection.", image_url: "https://example.com/danger13.jpg" },
            { nom: "Feu tricolore", description: "Présence de feux de signalisation.", image_url: "https://example.com/danger14.jpg" },
            { nom: "Cyclistes", description: "Présence de cyclistes sur la route.", image_url: "https://example.com/danger15.jpg" },
            { nom: "Vent latéral", description: "Risque de vents violents sur la route.", image_url: "https://example.com/danger16.jpg" },
            { nom: "Traversée d’enfants", description: "Proximité d’une école.", image_url: "https://example.com/danger17.jpg" },
            { nom: "Passage de tramway", description: "Intersection avec une voie de tramway.", image_url: "https://example.com/danger18.jpg" },
            { nom: "Tunnel", description: "Entrée d’un tunnel à venir.", image_url: "https://example.com/danger19.jpg" },
            { nom: "Carrefour dangereux", description: "Intersection risquée à venir.", image_url: "https://example.com/danger20.jpg" },
            { nom: "Chute de pierres", description: "Risque de chutes de pierres.", image_url: "https://example.com/danger21.jpg" },
            { nom: "Passage de cavaliers", description: "Présence de cavaliers sur la route.", image_url: "https://example.com/danger22.jpg" },
            { nom: "Passage de véhicules lents", description: "Présence de véhicules lents.", image_url: "https://example.com/danger23.jpg" },
            { nom: "Passage de véhicules agricoles", description: "Présence de véhicules agricoles.", image_url: "https://example.com/danger24.jpg" },
            { nom: "Passage de véhicules de chantier", description: "Présence de véhicules de chantier.", image_url: "https://example.com/danger25.jpg" }
        ]
    },
    {
        categorie: "interdiction",
        exemples: [
            { nom: "Sens interdit", description: "Interdiction d’entrer dans cette rue.", image_url: "https://example.com/interdiction1.jpg" },
            { nom: "Interdiction de dépasser", description: "Dépassement interdit.", image_url: "https://example.com/interdiction2.jpg" },
            { nom: "Interdiction aux poids lourds", description: "Camions interdits.", image_url: "https://example.com/interdiction3.jpg" },
            { nom: "Interdiction de stationner", description: "Stationnement interdit.", image_url: "https://example.com/interdiction4.jpg" },
            { nom: "Interdiction de tourner à gauche", description: "Virage à gauche interdit.", image_url: "https://example.com/interdiction5.jpg" },
            { nom: "Interdiction de tourner à droite", description: "Virage à droite interdit.", image_url: "https://example.com/interdiction6.jpg" },
            { nom: "Interdiction de klaxonner", description: "Usage du klaxon interdit.", image_url: "https://example.com/interdiction7.jpg" },
            { nom: "Interdiction aux piétons", description: "Accès interdit aux piétons.", image_url: "https://example.com/interdiction8.jpg" },
            { nom: "Interdiction de faire demi-tour", description: "Demi-tour interdit.", image_url: "https://example.com/interdiction9.jpg" },
            { nom: "Limite de poids", description: "Poids maximal autorisé.", image_url: "https://example.com/interdiction10.jpg" },
            { nom: "Interdiction de circuler", description: "Accès interdit à tous les véhicules.", image_url: "https://example.com/interdiction11.jpg" },
            { nom: "Interdiction de s’arrêter", description: "Arrêt interdit.", image_url: "https://example.com/interdiction12.jpg" },
            { nom: "Interdiction de circuler à vélo", description: "Vélos interdits.", image_url: "https://example.com/interdiction13.jpg" },
            { nom: "Interdiction de circuler à moto", description: "Motos interdites.", image_url: "https://example.com/interdiction14.jpg" },
            { nom: "Interdiction de circuler à pied", description: "Piétons interdits.", image_url: "https://example.com/interdiction15.jpg" },
            { nom: "Interdiction de circuler à cheval", description: "Cavaliers interdits.", image_url: "https://example.com/interdiction16.jpg" },
            { nom: "Interdiction de circuler en tracteur", description: "Tracteurs interdits.", image_url: "https://example.com/interdiction17.jpg" },
            { nom: "Interdiction de circuler en camionnette", description: "Camionnettes interdites.", image_url: "https://example.com/interdiction18.jpg" },
            { nom: "Interdiction de circuler en bus", description: "Bus interdits.", image_url: "https://example.com/interdiction19.jpg" },
            { nom: "Interdiction de circuler en car", description: "Cars interdits.", image_url: "https://example.com/interdiction20.jpg" }
        ]
    },
    {
        categorie: "obligation",
        exemples: [
            { nom: "Direction obligatoire à droite", description: "Vous devez tourner à droite.", image_url: "https://example.com/obligation1.jpg" },
            { nom: "Direction obligatoire à gauche", description: "Vous devez tourner à gauche.", image_url: "https://example.com/obligation2.jpg" },
            { nom: "Piste cyclable obligatoire", description: "Les vélos doivent emprunter cette voie.", image_url: "https://example.com/obligation3.jpg" },
            { nom: "Port du casque obligatoire", description: "Casque obligatoire pour les motards.", image_url: "https://example.com/obligation4.jpg" },
            { nom: "Port de la ceinture obligatoire", description: "Ceinture de sécurité obligatoire.", image_url: "https://example.com/obligation5.jpg" },
            { nom: "Vitesse minimale obligatoire", description: "Vitesse minimale à respecter.", image_url: "https://example.com/obligation6.jpg" },
            { nom: "Passage obligatoire à droite", description: "Vous devez passer à droite.", image_url: "https://example.com/obligation7.jpg" },
            { nom: "Passage obligatoire à gauche", description: "Vous devez passer à gauche.", image_url: "https://example.com/obligation8.jpg" },
            { nom: "Passage obligatoire en sens unique", description: "Vous devez circuler dans le sens indiqué.", image_url: "https://example.com/obligation9.jpg" },
            { nom: "Passage obligatoire en sens giratoire", description: "Vous devez circuler dans le sens giratoire.", image_url: "https://example.com/obligation10.jpg" },
            { nom: "Passage obligatoire en sens inverse", description: "Vous devez circuler dans le sens inverse.", image_url: "https://example.com/obligation11.jpg" },
            { nom: "Passage obligatoire en sens unique alterné", description: "Vous devez circuler dans le sens unique alterné.", image_url: "https://example.com/obligation12.jpg" },
            { nom: "Passage obligatoire en sens unique alterné avec priorité", description: "Vous devez circuler dans le sens unique alterné avec priorité.", image_url: "https://example.com/obligation13.jpg" },
            { nom: "Passage obligatoire en sens unique alterné sans priorité", description: "Vous devez circuler dans le sens unique alterné sans priorité.", image_url: "https://example.com/obligation14.jpg" },
            { nom: "Passage obligatoire en sens unique alterné avec priorité à droite", description: "Vous devez circuler dans le sens unique alterné avec priorité à droite.", image_url: "https://example.com/obligation15.jpg" },
            { nom: "Passage obligatoire en sens unique alterné avec priorité à gauche", description: "Vous devez circuler dans le sens unique alterné avec priorité à gauche.", image_url: "https://example.com/obligation16.jpg" },
            { nom: "Passage obligatoire en sens unique alterné avec priorité à droite et à gauche", description: "Vous devez circuler dans le sens unique alterné avec priorité à droite et à gauche.", image_url: "https://example.com/obligation17.jpg" },
            { nom: "Passage obligatoire en sens unique alterné avec priorité à droite et à gauche et en sens inverse", description: "Vous devez circuler dans le sens unique alterné avec priorité à droite et à gauche et en sens inverse.", image_url: "https://example.com/obligation18.jpg" },
            { nom: "Passage obligatoire en sens unique alterné avec priorité à droite et à gauche et en sens inverse et en sens unique alterné", description: "Vous devez circuler dans le sens unique alterné avec priorité à droite et à gauche et en sens inverse et en sens unique alterné.", image_url: "https://example.com/obligation19.jpg" },
            { nom: "Passage obligatoire en sens unique alterné avec priorité à droite et à gauche et en sens inverse et en sens unique alterné et en sens unique alterné avec priorité", description: "Vous devez circuler dans le sens unique alterné avec priorité à droite et à gauche et en sens inverse et en sens unique alterné et en sens unique alterné avec priorité.", image_url: "https://example.com/obligation20.jpg" }
        ]
    },
    {
        categorie: "indication",
        exemples: [
        {
            nom: "Direction",
            description: "Indication de direction vers une ville ou un lieu.",
            image_url: "https://example.com/indication1.jpg"
        },
        {
            nom: "Distance",
            description: "Indication de distance en kilomètres.",
            image_url: "https://example.com/indication2.jpg"
        },
        {
            nom: "Parking",
            description: "Indication d'un parking à proximité.",
            image_url: "https://example.com/indication3.jpg"
        },
        {
            nom: "Hôpital",
            description: "Indication de la direction vers un hôpital.",
            image_url: "https://example.com/indication4.jpg"
        },
        {
            nom: "Station-service",
            description: "Indication d'une station-service à proximité.",
            image_url: "https://example.com/indication5.jpg"
        },
        {
            nom: "Aire de repos",
            description: "Indication d'une aire de repos sur l'autoroute.",
            image_url: "https://example.com/indication6.jpg"
        },
        {
            nom: "Sortie d'autoroute",
            description: "Indication d'une sortie d'autoroute.",
            image_url: "https://example.com/indication7.jpg"
        },
        {
            nom: "Zone piétonne",
            description: "Indication d'une zone réservée aux piétons.",
            image_url: "https://example.com/indication8.jpg"
        },
        {
            nom: "Limite de vitesse recommandée",
            description: "Indication d'une vitesse recommandée.",
            image_url: "https://example.com/indication9.jpg"
        },
        {
            nom: "Fin de voie",
            description: "Indication de la fin d'une voie de circulation.",
            image_url: "https://example.com/indication10.jpg"
        }
        ]
    },
    {   categorie: "divers",
        exemples:[
         
        {
            nom: "Barrière de péage",
            description: "Barrière pour le paiement du péage sur une autoroute.",
            image_url: "https://example.com/divers1.jpg"
        },
        {
            nom: "Barrière de passage à niveau",
            description: "Barrière automatique pour les passages à niveau.",
            image_url: "https://example.com/divers2.jpg"
        },
        {
            nom: "Panneau de fin de limitation de vitesse",
            description: "Indique la fin d'une limitation de vitesse.",
            image_url: "https://example.com/divers3.jpg"
        },
        {
            nom: "Panneau de fin d'interdiction de dépasser",
            description: "Indique la fin d'une interdiction de dépasser.",
            image_url: "https://example.com/divers4.jpg"
        },
        {
            nom: "Panneau de fin de zone",
            description: "Indique la fin d'une zone réglementée (ex : zone 30).",
            image_url: "https://example.com/divers5.jpg"
        },
        {
            nom: "Panneau de priorité ponctuelle",
            description: "Indique une priorité ponctuelle (ex : priorité à droite).",
            image_url: "https://example.com/divers6.jpg"
        },
        {
            nom: "Panneau de signalisation temporaire",
            description: "Panneau utilisé pour les travaux ou les événements temporaires.",
            image_url: "https://example.com/divers7.jpg"
        },
        {
            nom: "Barrière de contrôle d'accès",
            description: "Barrière utilisée pour contrôler l'accès à une zone.",
            image_url: "https://example.com/divers8.jpg"
        },
        {
            nom: "Panneau de signalisation de voie réservée",
            description: "Indique une voie réservée (ex : bus, véhicules d'urgence).",
            image_url: "https://example.com/divers9.jpg"
        },
        {
            nom: "Panneau de signalisation de zone scolaire",
            description: "Indique une zone scolaire avec des règles spécifiques.",
            image_url: "https://example.com/divers10.jpg"
        },
        {
            nom: "Panneau de signalisation de zone industrielle",
            description: "Indique une zone industrielle avec des règles spécifiques.",
            image_url: "https://example.com/divers11.jpg"
        },
        {
            nom: "Panneau de signalisation de zone touristique",
            description: "Indique une zone touristique avec des règles spécifiques.",
            image_url: "https://example.com/divers12.jpg"
        },
        {
            nom: "Panneau de signalisation de zone résidentielle",
            description: "Indique une zone résidentielle avec des règles spécifiques.",
            image_url: "https://example.com/divers13.jpg"
        },
        {
            nom: "Panneau de signalisation de zone de rencontre",
            description: "Indique une zone de rencontre où piétons et véhicules partagent la voie.",
            image_url: "https://example.com/divers14.jpg"
        },
        {
            nom: "Panneau de signalisation de zone de livraison",
            description: "Indique une zone réservée aux livraisons.",
            image_url: "https://example.com/divers15.jpg"
        },
        {
            nom: "Panneau de signalisation de zone de stationnement",
            description: "Indique une zone de stationnement spécifique.",
            image_url: "https://example.com/divers16.jpg"
        },
        {
            nom: "Panneau de signalisation de zone de chantier",
            description: "Indique une zone de chantier avec des règles spécifiques.",
            image_url: "https://example.com/divers17.jpg"
        },
        {
            nom: "Panneau de signalisation de zone de danger",
            description: "Indique une zone de danger avec des règles spécifiques.",
            image_url: "https://example.com/divers18.jpg"
        },
        {
            nom: "Panneau de signalisation de zone de secours",
            description: "Indique une zone de secours avec des règles spécifiques.",
            image_url: "https://example.com/divers19.jpg"
        },
        {
            nom: "Panneau de signalisation de zone de déviation",
            description: "Indique une zone de déviation avec des règles spécifiques.",
            image_url: "https://example.com/divers20.jpg"
        }
    ]
   }
];

Panneau.insertMany(panneaux)
    .then(() => {
        console.log("✅ Insertion réussie !");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("❌ Erreur d'insertion :", err);
        mongoose.connection.close();
    });

// 📌 Fonction pour insérer les panneaux dans MongoDB
async function insertPanneaux() {
    try {
        await Panneau.deleteMany(); // Supprime les anciens panneaux pour éviter les doublons
        await Panneau.insertMany(panneaux);
        console.log("✅ Tous les panneaux ont été insérés avec succès !");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Erreur lors de l’insertion :", error);
    }
}

insertPanneaux();
