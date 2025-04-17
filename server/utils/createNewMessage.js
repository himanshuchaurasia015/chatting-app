const Message = require("../models/Message");

exports.sendMessage = async (message) => {
  const { chatId, from, text, contentType = "text" } = message;

  try {
    const result = await Message.create({
      chatId: chatId,
      sender: from,
      content: text,
      contentType,
    });
    console.log(result);
    return true;
  } catch (error) {
    return false;
  }
};
