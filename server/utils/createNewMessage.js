const Message = require("../models/Message");

exports.sendMessage = async (message) => {
  const { chatId, sender, content, text, contentType = "text" } = message;
  try {
    let result = await Message.create({
      chatId: chatId,
      sender,
      content,
      contentType,
    });
    await result.populate("sender", "name email profilePicture");
    result = {
      _id: result._id,
      contentType: result.contentType,
      to: message.to,
      chatId: result.chatId,
      content: result.content,
      readBy: result.readBy,
      senderDetails: result.sender,
      sender: result.sender._id,
      createdAt: result.createdAt,
    };
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};
