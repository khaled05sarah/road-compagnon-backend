const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();

// Middleware pour parser JSON (à ajouter dans server.js si pas encore fait)
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 🔹 Configuration de Nodemailer avec mot de passe d'application
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Adresse Gmail
        pass: process.env.EMAIL_PASS, // Mot de passe d'application généré sur Google
    },
});

// 🔹 Fonction pour générer un code de vérification à 6 chiffres
const generateVerificationCode = () => crypto.randomInt(100000, 999999).toString();

// 🔹 Route d'inscription
router.post('/register', async(req, res) => {
    try {
        console.log("📩 Données reçues :", req.body);

        const { firstname, lastname, email, phone, password } = req.body;

        // Vérification des champs requis
        if (!firstname || !lastname || !email || !phone || !password) {
            console.log("❌ Champs manquants :", { firstname, lastname, email, phone, password });
            return res.status(400).json({ error: "Tous les champs sont obligatoires." });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "L'email est déjà utilisé." });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();

        // Création de l'utilisateur
        const newUser = new User({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword,
            verificationCode, // Stocker le code
            verified: false, // Par défaut, l'utilisateur n'est pas vérifié
        });

        await newUser.save();

        // Envoi du code de vérification par e-mail
        const mailOptions = {
            from: `"Mon App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Vérification de votre compte",
            html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Erreur d'envoi d'email :", error);
                return res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
            }
            console.log(`📧 Email envoyé à ${email} : ${info.response}`);
        });

        res.status(201).json({ message: "Utilisateur créé ! Code de vérification envoyé par e-mail." });

    } catch (error) {
        console.error("❌ Erreur lors de l'inscription :", error);
        res.status(500).json({ message: "Erreur serveur.", error });
    }
});

// 🔹 Vérification du code reçu par e-mail
router.post('/verify', async(req, res) => {
    try {
        console.log("📩 Vérification - Données reçues :", req.body);

        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: "L'email et le code sont requis." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Utilisateur non trouvé." });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: "Code de vérification incorrect." });
        }

        // Marquer l'utilisateur comme vérifié
        user.verified = true;
        user.verificationCode = null;
        await user.save();

        console.log(`✅ Compte vérifié pour ${email}`);

        res.json({ message: "Compte vérifié avec succès !" });

    } catch (error) {
        console.error("❌ Erreur lors de la vérification :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// 🔹 Connexion
router.post('/login', async(req, res) => {
    try {
        console.log("📩 Connexion - Données reçues :", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Utilisateur non trouvé." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect." });
        }

        if (!user.verified) {
            return res.status(403).json({ message: "Veuillez vérifier votre compte avant de vous connecter." });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION,
        });

        console.log(`🔐 Utilisateur ${email} connecté avec succès !`);

        res.json({status:200, message: "Connexion réussie !", token });

    } catch (error) {
        console.error("❌ Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// 🔹 EXPORT DU ROUTER
module.exports = router;