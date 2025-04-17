const express = require("express");
const {
  verify,
  register,
  users,
  getUser,
  login,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/verify",authMiddleware, verify);
router.post("/register", register);
router.post("/login", login);
router.get("/users", authMiddleware, users);
router.get("/user/:id", authMiddleware, getUser);

module.exports = router;
