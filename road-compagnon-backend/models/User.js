const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: false, default: "" }, // Plus obligatoire
    lastname: { type: String, required: false, default: "" },  // Plus obligatoire
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String ,required:true},
    role: { type: String, default: "user" },
    phone: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);