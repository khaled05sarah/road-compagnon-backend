const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/emp_type/User');
const Mechanic = require('../../models/emp_type/mechanic');
const Towing = require('../../models/emp_type/Towing');
const Vendor = require('../../models/emp_type/Vendor');
const Admin = require('../../models/emp_type/Admin');
const upload = require("../../upload"); // Importer multer
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mechanic = require('../../models/emp_type/mechanic');
require('dotenv').config();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 🔹 Configuration Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 🔹 Générer un code de vérification aléatoire
const generateVerificationCode = () => crypto.randomInt(100000, 999999).toString();

// 🔹 Inscription d'un nouvel utilisateur avec confirmation de mot de passe et choix du sexe
router.post('/register', async (req, res) => {
    try {
        console.log("📩 Inscription - Données reçues :", req.body);

        let { firstname, lastname, email, phone, password, confirmPassword, sex } = req.body;

        // Nettoyage des entrées
        firstname = firstname?.trim() || "Utilisateur";
        lastname = lastname?.trim() || "Inconnu";
        email = email?.trim();
        phone = phone?.trim();
        sex = sex?.trim().toLowerCase() || "ذكر"; // Valeur par défaut : masculin

        // Vérification des champs requis
        if (!email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ error: "Email, téléphone et mot de passe sont obligatoires." });
        }

        // Vérification de la correspondance des mots de passe
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }

        // Vérification du mot de passe (8 caractères minimum, au moins une lettre et un chiffre)
        const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 8 caractères, dont un chiffre et une lettre."
            });
        }

        // Vérification du sexe (si renseigné)
        const allowedSexValues = ["أنثى", "ذكر"];
        if (!allowedSexValues.includes(sex)) {
            return res.status(400).json({ message: "Le sexe doit être 'feminin' ou 'masculin'." });
        }

        // Vérifier si l'email est déjà utilisé
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "L'email est déjà utilisé." });
        }

        // Vérifier si le numéro de téléphone est déjà utilisé
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            return res.status(400).json({ message: "Le numéro de téléphone est déjà utilisé." });
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
            verificationCode,
            verified: false,
            role: "مستخدم عادي",
            sex
        });

        await newUser.save();

        // Envoi du code de vérification par e-mail
        const mailOptions = {
            from: `"Mon App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Vérification de votre compte",
            html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p>`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`📧 Email envoyé à ${email}`);
        } catch (mailError) {
            console.error("❌ Erreur d'envoi d'email :", mailError);
        }

        res.status(201).json({ message: "Utilisateur créé ! Code de vérification envoyé par e-mail." });

    } catch (error) {
        console.error("❌ Erreur lors de l'inscription :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});
router.post('/formulaire1', async(req, res) => {
    try {
        console.log("📩 Mise à jour du formulaire1 - Données reçues :", req.body);

        let { email, firstname, lastname, sex, role } = req.body;

        // Vérifier si l'email est fourni
        if (!email) {
            return res.status(400).json({ message: "L'email est obligatoire pour identifier l'utilisateur." });
        }

        // Trouver l'utilisateur dans la base de données
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // ...existing code...
        // Nettoyage des données et valeurs par défaut
        firstname = firstname ? firstname.trim() : user.firstname;
        lastname = lastname ? lastname.trim() : user.lastname;
        sex = sex ? sex.trim().toLowerCase() : user.sex;
        role = role || user.role;
        // ...existing code...

        // Vérification du sexe (optionnel)
        const allowedSexValues = ["أنثى", "ذكر"];
        if (sex && !allowedSexValues.includes(sex)) {
            return res.status(400).json({ message: "Le sexe doit être 'feminin' ou 'masculin'." });
        }

        // Mise à jour des données
        user.firstname = firstname;
        user.lastname = lastname;
        user.sex = sex;
        user.role = role;

        await user.save();
        if (role === "user") {
            const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.status(201).json({
                message: "Utilisateur créé et connecté avec succès !",
                token,
                user: { firstname, lastname, email, role }
            });
        }
        res.json({ message: "Informations mises à jour avec succès !" });

    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du formulaire1 :", error);
        res.status(500).json({ message: "Erreur serveur." });
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
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: "Code de vérification incorrect." });
        }

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

// 🔹 Envoi d'un code pour réinitialiser le mot de passe
router.post('/forgot-password', async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const resetCode = generateVerificationCode();
        user.resetCode = resetCode;
        await user.save();

        const mailOptions = {
            from: `"Mon App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Réinitialisation du mot de passe",
            html: `<p>Votre code de réinitialisation est : <strong>${resetCode}</strong></p>`,
        };

        transporter.sendMail(mailOptions);

        res.json({ message: "Code de réinitialisation envoyé à votre e-mail." });

    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du code de réinitialisation :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// 🔹 Réinitialisation du mot de passe avec confirmation
router.post('/verify-reset-code', async(req, res) => {
    try {
        const { email, resetCode } = req.body;

        if (!email || !resetCode) {
            fcr
            return res.status(400).json({ message: "Email et code de réinitialisation requis." });
        }

        const user = await User.findOne({ email, resetCode });
        if (!user) {
            return res.status(400).json({ message: "Code incorrect ou utilisateur introuvable." });
        }

        res.json({ message: "Code valide, vous pouvez maintenant réinitialiser votre mot de passe." });

    } catch (error) {
        console.error("❌ Erreur lors de la vérification du code :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});
router.post('/reset-password', async(req, res) => {
    try {
        const { email, newPassword, confirmNewPassword } = req.body;

        if (!email || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }

        const user = await User.findOne({ email });
        if (!user || !user.resetCode) {
            return res.status(400).json({ message: "Réinitialisation non autorisée." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetCode = null; // Réinitialiser le code de récupération
        await user.save();

        res.json({ message: "Mot de passe réinitialisé avec succès." });

    } catch (error) {
        console.error("❌ Erreur lors de la réinitialisation du mot de passe :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});


router.post('/login', async (req, res) => {
    try {
        console.log("📩 Connexion - Données reçues :", req.body);

        const { email, password } = req.body;

        // Vérification des champs requis
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }

        // Recherche dans Admin
        let user = await Admin.findOne({ email });
        let role = "admin";
        let tokenPayload = {};

        if (!user) {
            // Recherche dans User
            user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            role = user.role;

            // Refuser la connexion si le compte utilisateur n'est pas vérifié
            if (!user.verified) {
                return res.status(400).json({ message: "Compte non vérifié. Veuillez vérifier votre email." });
            }

            // Préparer les données communes du token
            tokenPayload = {
                id: user._id,
                role: user.role,
                lastname: user.lastname,
                firstname: user.firstname,
                email: user.email,
                phone: user.phone
            };

            // Ajout des infos spécifiques au rôle
            if (role === "ميكانيكي") {
                const mechanic = await Mechanic.findOne({ userId: user._id });
                if (mechanic) {
                    tokenPayload.businessAddress = mechanic.businessAddress;
                    tokenPayload.phonePro = mechanic.phonePro;
                }
            } else if (role === "بائع قطع الغيار") {
                const vendor = await Vendor.findOne({ userId: user._id });
                if (vendor) {
                    tokenPayload.businessAddress = vendor.businessAddress;
                    tokenPayload.phonePro = vendor.phonePro;
                }
            } else if (role === "عامل سحب السيارات") {
                const towing = await Towing.findOne({ userId: user._id });
                if (towing) {
                    tokenPayload.businessAddress = towing.businessAddress;
                    tokenPayload.phonePro = towing.phonePro;
                }
            }

        } else {
            // Admin : définir les infos minimales
            tokenPayload = {
                id: user._id,
                role: "admin",
                email: user.email
            };
        }

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(403).json({ message: "Mot de passe incorrect." });
        }

        // Génération du token JWT
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: `Connexion réussie (${role}) !`,
            token,
            user: tokenPayload
        });

    } catch (error) {
        console.error("❌ Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});


// 🔹 Route pour supprimer un utilisateur avec confirmation du mot de passe
router.delete('/delete-account', async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect." });
        }

        await Mechanic.deleteOne({ userId: user._id });
        await Towing.deleteOne({ userId: user._id });
        await Vendor.deleteOne({ userId: user._id });
        await User.deleteOne({ _id: user._id });

        res.json({ message: "Compte supprimé avec succès." });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression du compte :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});
const uploadFields = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'commerceRegister', maxCount: 1 },
    { name: 'carteidentite', maxCount: 1 }
]);

router.post('/upgrade', uploadFields, async (req, res) => {
    console.log("📩 Body reçu :", req.body);
    console.log("📂 Fichiers reçus :", req.files);

    try {
        const { email, businessAddress, phonePro } = req.body;

        // Vérification des champs obligatoires
        if (!email || !phonePro || !businessAddress) {
            return res.status(400).json({ message: "L'email, le téléphone professionnel et l'adresse sont requis." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Afficher le rôle exact reçu
        console.log("🎭 Rôle de l'utilisateur :", user.role);

        // Vérification du rôle
        const validRoles = ["ميكانيكي", "بائع قطع الغيار", "عامل سحب السيارات"];
        if (!validRoles.includes(user.role.trim())) {
            return res.status(400).json({ message: "Le rôle de l'utilisateur est invalide ou non défini." });
        }

        // Vérification des fichiers requis
        const files = req.files;
        if (!files.profilePhoto || !files.commerceRegister || !files.carteidentite) {
            return res.status(400).json({ message: "Les fichiers (photo, registre de commerce, carte d'identité) sont requis." });
        }

        // Données communes
        const baseData = {
            userId: user._id,
            businessAddress,
            phonePro,
            profilePhoto: files.profilePhoto[0].path,
            commerceRegister: files.commerceRegister[0].path,
            carteidentite: files.carteidentite[0].path
        };

        // Création de l'objet selon le rôle
        let newEntry;
        const role = user.role.trim();

        if (role === 'ميكانيكي') {
            console.log("🔧 C'est un mécanicien");
            newEntry = new Mechanic(baseData);
        } else if (role === 'عامل سحب السيارات') {
            console.log("🚚 C'est un dépanneur");
            newEntry = new Towing(baseData);
        } else if (role === 'بائع قطع الغيار') {
            console.log("🔩 C'est un vendeur de pièces");
            newEntry = new Vendor(baseData);
        }

        // Sauvegarde et retour
        if (newEntry) {
            await newEntry.save()
                .then(() => {
                    console.log("✅ Donnée enregistrée avec succès !");
                    res.json({ message: `Utilisateur promu en ${user.role} avec succès !` });
                })
                .catch((err) => {
                    console.error("❌ Erreur lors de la sauvegarde :", err);
                    res.status(500).json({ message: "Erreur lors de l'enregistrement en base de données." });
                });
        } else {
            console.log("⚠️ Aucun modèle n'a été instancié.");
            res.status(400).json({ message: "Impossible de créer l'entrée pour ce rôle." });
        }

    } catch (error) {
        console.error("❌ Erreur lors de l'upgrade :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});



// 🔹 Route pour récupérer tous les mécaniciens
router.get('/mechanics', async(req, res) => {
    try {
        const mechanics = await Mechanic.find().populate('userId', 'firstname lastname email');
        res.json(mechanics);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des mécaniciens :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});
// 🔹 Route pour supprimer un utilisateur d'un rôle et réinitialiser son rôle à "user"
router.delete('/downgrade', async(req, res) => {
    try {
        const { email, password, deleteUser } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe sont requis." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect." });
        }

        // Si deleteUser est vrai, on supprime complètement l'utilisateur
        if (deleteUser) {
            await Mechanic.deleteOne({ userId: user._id });
            await Towing.deleteOne({ userId: user._id });
            await Vendor.deleteOne({ userId: user._id });
            await User.deleteOne({ _id: user._id });
            return res.json({ message: "Compte utilisateur supprimé avec succès." });
        }

        // Vérifier le rôle et supprimer l'entrée correspondante
        if (user.role === 'mechanic') {
            await Mechanic.deleteOne({ userId: user._id });
        } else if (user.role === 'towing') {
            await Towing.deleteOne({ userId: user._id });
        } else if (user.role === 'vendor') {
            await Vendor.deleteOne({ userId: user._id });
        } else {
            return res.status(400).json({ message: "L'utilisateur n'a pas de rôle spécifique à supprimer." });
        }

        // Remettre le rôle à "user"
        user.role = 'user';
        await user.save();

        res.json({ message: `Utilisateur rétrogradé à "user" avec succès.` });

    } catch (error) {
        console.error("❌ Erreur lors du downgrade :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});
router.patch('/update-profile', async(req, res) => {
    try {
        const { email, firstname, lastname, newEmail, phone, phonePro, businessAddress } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email requis pour identifier l'utilisateur." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // ✅ Vérifier si le nouvel email est déjà utilisé
        if (newEmail && newEmail !== email) {
            const existing = await User.findOne({ email: newEmail });
            if (existing) {
                return res.status(400).json({ message: "Cet email est déjà utilisé par un autre utilisateur." });
            }
            user.email = newEmail;
        }

        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (phone) user.phone = phone;

        await user.save();

        // Mise à jour des informations professionnelles selon le rôle
        if (user.role === "ميكانيكي") {
            const mechanic = await Mechanic.findOne({ userId: user._id });
            if (mechanic) {
                if (phonePro) mechanic.phonePro = phonePro;
                if (businessAddress) mechanic.businessAddress = businessAddress;
                await mechanic.save();
            }
        }

        if (user.role === "بائع قطع الغيار") {
            const vendor = await Vendor.findOne({ userId: user._id });
            if (vendor) {
                if (phonePro) vendor.phonePro = phonePro;
                if (businessAddress) vendor.businessAddress = businessAddress;
                await vendor.save();
            }
        }

        if (user.role === "عامل سحب السيارات") {
            const towing = await Towing.findOne({ userId: user._id });
            if (towing) {
                if (phonePro) towing.phonePro = phonePro;
                if (businessAddress) towing.businessAddress = businessAddress;
                await towing.save();
            }
        }

        // ➔ Générer un nouveau token à jour
        const tokenPayload = {
            id: user._id,
            role: user.role,
            lastname: user.lastname,
            firstname: user.firstname,
            email: user.email,
            phone: user.phone
        };

        // Ajouter aussi les nouvelles informations pro au token
        if (user.role === "ميكانيكي") {
            const mechanic = await Mechanic.findOne({ userId: user._id });
            if (mechanic) {
                tokenPayload.businessAddress = mechanic.businessAddress;
                tokenPayload.phonePro = mechanic.phonePro;
            }
        }

        if (user.role === "بائع قطع الغيار") {
            const vendor = await Vendor.findOne({ userId: user._id });
            if (vendor) {
                tokenPayload.businessAddress = vendor.businessAddress;
                tokenPayload.phonePro = vendor.phonePro;
            }
        }

        if (user.role === "عامل سحب السيارات") {
            const towing = await Towing.findOne({ userId: user._id });
            if (towing) {
                tokenPayload.businessAddress = towing.businessAddress;
                tokenPayload.phonePro = towing.phonePro;
            }
        }

        const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user,
            token: newToken
        });

    } catch (error) {
        console.error("❌ Erreur modification profil :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// 🔹 Supprimer compte après saisie du mot de passe 2 fois
router.delete('/delete-account', async(req, res) => {
    try {
        const { email, password1, password2 } = req.body;

        if (!email || !password1 || !password2) {
            return res.status(400).json({ message: "Veuillez saisir les deux mots de passe." });
        }

        if (password1 !== password2) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const isMatch = await bcrypt.compare(password1, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect." });
        }

        // Supprimer l'utilisateur et ses rôles associés
        await Mechanic.deleteOne({ userId: user._id });
        await Towing.deleteOne({ userId: user._id });
        await Vendor.deleteOne({ userId: user._id });
        await User.deleteOne({ _id: user._id });

        res.json({ message: "🗑️ Compte supprimé avec succès." });

    } catch (error) {
        console.error("❌ Erreur suppression compte :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});
// 🔐 Modifier mot de passe
router.patch('/change-password', async(req, res) => {
    try {
        const { email, ancienPassword, nouveauPassword1, nouveauPassword2 } = req.body;

        if (!email || !ancienPassword || !nouveauPassword1 || !nouveauPassword2) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        if (nouveauPassword1 !== nouveauPassword2) {
            return res.status(400).json({ message: "Les nouveaux mots de passe ne correspondent pas." });
        }

        // 🔎 Vérification de la force du nouveau mot de passe
        const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(nouveauPassword1)) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 8 caractères, dont un chiffre et une lettre."
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const isMatch = await bcrypt.compare(ancienPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Ancien mot de passe incorrect." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(nouveauPassword1, salt);

        user.password = hashed;
        await user.save();

        res.json({ message: "🔐 Mot de passe modifié avec succès." });

    } catch (error) {
        console.error("❌ Erreur changement mot de passe :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// 🔹 Export du routeur
module.exports = router;