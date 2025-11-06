const express = require("express");
const router = express.Router();
const {
  register,
  verifyOtp,
  login,
  getProfile,
  updateProfile,
  deleteAccount,
  getAllUsers
} = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");

// Auth routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

// User routes (protégées)
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.delete("/profile", auth, deleteAccount);

// Admin (exemple)
router.get("/users", auth, getAllUsers);

module.exports = router;
