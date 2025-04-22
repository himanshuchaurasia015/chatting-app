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
      contentType: result.contentType,
      chatId: result.chatId,
      content: result.content,
      senderDetails: result.sender,
      sender: result.sender._id,
    };
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};
