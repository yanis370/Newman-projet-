const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtp = require("../utils/sendOtp");

// =================== REGISTER ===================
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({ email, password: hashed, otp });
    await user.save();

    // Envoi du mail OTP (désactive si tu veux juste tester sans SMTP)
    try {
      await sendOtp(email, otp);
    } catch (e) {
      console.warn("⚠️ Échec d'envoi OTP, mais utilisateur créé :", e.message);
    }

    // ✅ Retourne aussi le code OTP pour test Postman
    res.json({
      msg: "Utilisateur créé, OTP envoyé !",
      otp: otp,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =================== VERIFY OTP ===================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) return res.status(400).json({ msg: "OTP invalide" });

    user.verified = true;
    user.otp = null;
    await user.save();

    res.json({ msg: "Compte vérifié avec succès !" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =================== LOGIN ===================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Utilisateur introuvable" });
    if (!user.verified) return res.status(400).json({ msg: "Compte non vérifié" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ msg: "Connexion réussie", token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =================== GET PROFILE ===================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =================== UPDATE PROFILE ===================
exports.updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updates = {};

    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password -otp");
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    res.json({ msg: "Profil mis à jour", user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =================== DELETE ACCOUNT ===================
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    res.json({ msg: "Compte supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =================== GET ALL USERS (ADMIN) ===================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
