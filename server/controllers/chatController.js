const Chat = require("../models/Chat");
const Message = require("../models/Message");

exports.getAllChats = async (req, res) => {
  const { _id: userId } = req.user;

  try {
    let chats = await Chat.find({ users: { $all: [userId] } });

    await Chat.populate(chats, {
      path: "users",
      select: "name profilePicture mobileNumber",
    });

    const messages = await Message.find({
      chatId: { $in: chats.map((c) => c._id) },
    })
      .populate("sender", "name profilePicture mobileNumber")
      .sort({ createdAt: 1 });

    const messagesByChat = {};
    chats.forEach((chat) => {
      messagesByChat[chat._id] = messages.filter(
        (msg) => msg.chatId.toString() === chat._id.toString()
      );
    });

    res.json({ chats, messages: messagesByChat });
  } catch (error) {
    console.error(error); // optional, for debugging
    res.status(500).json({ error: "Server error" });
  }
};

// Create or get personal chat with messages
exports.getOrCreatePersonalChat = async (req, res) => {
  const { userId1, userId2 } = req.body;

  try {
    if (!userId1 || !userId2) {
      return res.status(400).json({
        msg: "all fields required",
      });
    }
    let chat = await Chat.findOne({
      isGroup: false,
      users: { $all: [userId1, userId2], $size: 2 },
    });

    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        users: [userId1, userId2],
      });
    }

    await Chat.populate(chat, {
      path: "users",
      select: "name profilePicture mobileNumber",
    });

    // const messages = await Message.find({ chat: chat._id })
    //   .populate("sender", "name profilePicture mobileNumber")
    //   .sort({ createdAt: 1 });

    res.json({
      chat,
      //  messages
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Create group chat with messages
exports.createGroupChat = async (req, res) => {
  const { chatName, users, description, groupAdmin, groupId, isGroup } =
    req.body;

  try {
    const members = Array.from(new Set([...users, groupAdmin]));

    const chat = await Chat.create({
      isGroup,
      chatName,
      users: members,
      description,
      groupAdmin,
      groupId,
    });
    console.log(chat);

    await chat.populate("users", "name profilePicture");

    res.json({ chat, messages: [] }); // No messages yet
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Send message to a chat
exports.sendMessage = async (req, res) => {
  const { chatId, sender, content, contentType = "text" } = req.body;
  console.log(req.body);
  try {
    const result = await Message.create({
      chatId: chatId,
      sender: sender,
      content: content,
      contentType,
    });
    console.log(result);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not send message" });
  }
};

// Get all messages in a chat
exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  console.log(chatId);
  try {
    const messages = await Message.find({ chatId: chatId })
      .populate("sender", "name profilePicture mobileNumber")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch messages" });
  }
};

exports.getChatDetails = async (req, res) => {
  const { chatId } = req.params;
  console.log(chatId);
  try {
    const chat = await Chat.findById(chatId);

    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not fetch messages" });
  }
};

exports.unReadMessages = async (req, res) => {
  try {
    console.log("hello");
    const { _id: userId } = req.user;
    console.log("fetching unread", userId);
    console.log("mark all as read is updated");
    let messages = await Message.find({
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });
    let unread = {};
    for (const element of messages) {
      const chatId = element.chatId;
      if (chatId in unread) {
        unread[chatId] += 1;
      } else {
        unread[chatId] = 1;
      }
    }

    return res.status(200).json(unread);
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      err: error,
    });
  }
};

// exports.unReadMessages = async (req, res) => {
//   const { _id: userId } = req.user;
//   console.log("Fetching unread for", userId);

//   try {
//     const unread = await Message.aggregate([
//       {
//         $match: {
//           sender: { $ne: userId },
//           readBy: { $ne: userId },
//         },
//       },
//       {
//         $group: {
//           _id: "$chatId",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const unreadFormatted = {};
//     unread.forEach((entry) => {
//       unreadFormatted[entry._id] = entry.count;
//     });

//     return res.status(200).json(unreadFormatted);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ err: error.message });
//   }
// };
