const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../../models/emp_type/User');
const Mechanic = require('../../models/emp_type/mechanic');
const Vendor = require('../../models/emp_type/Vendor');
const Towing = require('../../models/emp_type/Towing');
const upload = require("../../upload"); // Importer multer
const bcrypt = require('bcryptjs');

router.post('/createuser', async (req, res) => {
    try {
        // Debug: Log incoming request body
        console.log("Received request body:", req.body);

        const { firstname, lastname, email, phone, password, sex, role } = req.body;

        // Check for missing fields
        if (!firstname || !lastname || !email || !phone || !password || !sex || !role) {
            console.log("Validation failed: Missing required fields.");
            return res.status(400).json({ success: false, message: "جميع الحقول مطلوبة." });
        }

        // Debug: Log user fields
        console.log(`Trying to create user: ${firstname} ${lastname}, Email: ${email}`);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists with this email:", email);
            return res.status(400).json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل." });
        }

        // Validate role
        const validRoles = ["مستخدم عادي", "ميكانيكي", "بائع قطع الغيار", "عامل سحب السيارات"];
        if (!validRoles.includes(role)) {
            console.log("Invalid role provided:", role);
            return res.status(400).json({ success: false, message: "الدور غير صالح." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Debug: Log hashed password (Optional: Do not log in production for security reasons)
        console.log("Hashed password:", hashedPassword);

        // Create new user
        const newUser = new User({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword,
            sex,
            role, // ✅ Stocké en arabe directement
            verified: true
        });

        await newUser.save();

        // Debug: Log the created user object
        console.log("Created user:", newUser);

        // Return success response
        res.status(200).json({
            success: true,
            message: "تم إنشاء المستخدم بنجاح.",
            user: newUser
        });

    } catch (error) {
        // Log error details for debugging
        console.error("خطأ في الخادم:", error);
        res.status(500).json({ success: false, message: "خطأ في الخادم", error: error.message });
    }
});

const uploadFields = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'commerceRegister', maxCount: 1 },
    { name: 'carteidentite', maxCount: 1 },

]);
router.post('/complete-profile', uploadFields, async(req, res) => {
    try {
        const { email, businessAddress, serviceArea, shopAddress, phonePro } = req.body;
        const files = req.files;

        if (!email || !phonePro) {
            return res.status(400).json({ message: "البريد الإلكتروني ورقم الهاتف المهني مطلوبان." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود." });
        }

        if (!["ميكانيكي", "عامل سحب السيارات", "بائع قطع الغيار"].includes(user.role)) {
            return res.status(400).json({ message: "دور المستخدم غير صالح." });
        }

        if (!files.profilePhoto || !files.commerceRegister || !files.carteidentite) {
            return res.status(400).json({ message: "يجب تقديم جميع الملفات المطلوبة." });
        }

        let newEntry;

        if (user.role === 'ميكانيكي') {
            if (!businessAddress) {
                return res.status(400).json({ message: "عنوان الورشة مطلوب للميكانيكي" });
            }
            newEntry = new Mechanic({
                userId: user._id,
                businessAddress,
                phonePro,
                profilePhoto: files.profilePhoto[0].path,
                commerceRegister: files.commerceRegister[0].path,
                carteidentite: files.carteidentite[0].path
            });

        } else if (user.role === 'عامل سحب السيارات') {
            if (!serviceArea || !files.papiersduvehicule) {
                return res.status(400).json({ message: "جميع الحقول والوثائق مطلوبة لعامل سحب السيارات" });
            }
            newEntry = new Towing({
                userId: user._id,
                serviceArea,
                phonePro,
                profilePhoto: files.profilePhoto[0].path,
                commerceRegister: files.commerceRegister[0].path,
                carteidentite: files.carteidentite[0].path
            });

        } else if (user.role === 'بائع قطع الغيار') {
            if (!shopAddress) {
                return res.status(400).json({ message: "عنوان المتجر مطلوب للبائع" });
            }
            newEntry = new Vendor({
                userId: user._id,
                shopAddress,
                phonePro,
                profilePhoto: files.profilePhoto[0].path,
                commerceRegister: files.commerceRegister[0].path,
                carteidentite: files.carteidentite[0].path
            });
        }

        if (newEntry) {
            await newEntry.save();
            return res.status(200).json({
                message: `تم استكمال ملف ${user.role} بنجاح!`,
                user: newEntry
            });
        }

    } catch (error) {
        console.error("❌ خطأ أثناء استكمال الملف:", error);
        res.status(500).json({ message: "خطأ في الخادم" });
    }
});
// 📌 ➤ Lister tous les utilisateurs avec seulement les champs nécessaires
router.get('/', async(req, res) => {
    try {
        const users = await User.find().select('firstname lastname email phone role sex'); // ✅ Sélection des champs
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Utilisateurs récupérés avec succès.",
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Erreur serveur.",
            error: error.message
        });
    }
});

// 📌 ➤ Modifier un utilisateur (email, prénom, nom, téléphone uniquement)
router.put('/users/:id', async(req, res) => {
    try {
        const { firstname, lastname, email, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id, { firstname, lastname, email, phone }, { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Utilisateur non trouvé."
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Utilisateur mis à jour avec succès.",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Erreur serveur.",
            error: error.message
        });
    }
});


// 📌 ➤ Supprimer un utilisateur
router.delete('/users/:id', async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, statusCode: 404, message: "Utilisateur non trouvé." });
        }

        res.status(200).json({ success: true, statusCode: 200, message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: "Erreur serveur.", error: error.message });
    }
});
module.exports = router;