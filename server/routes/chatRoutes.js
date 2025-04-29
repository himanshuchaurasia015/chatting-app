const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/all/:userId", authMiddleware, chatController.getAllChats);
router.post(
  "/personal",
  authMiddleware,
  chatController.getOrCreatePersonalChat
);
router.get("/:chatId", authMiddleware, chatController.getChatDetails);
router
  .route("/group")
  .all(authMiddleware)
  .get(chatController.createGroupChat)
  .put(chatController.updateGroupChat);
router.post("/group", authMiddleware, chatController.createGroupChat);
router.post("/message", authMiddleware, chatController.sendMessage);
router.get("/messages/:chatId", authMiddleware, chatController.getMessages);
router.get("/", authMiddleware, chatController.unReadMessages);

module.exports = router;
