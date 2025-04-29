const Message = require("../models/Message");

exports.markAsRead = async (message) => {
  const { _id, userId } = message;
  try {
    let result = await Message.findByIdAndUpdate(
      _id,
      { $push: { readBy: userId } },
      { new: true }
    );
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

exports.markAllAsRead = async (message) => {
  const { chatId, userId } = message;
  // console.log("mark all as read is updated");
  try {
    let messages = await Message.find({
      chatId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    }).populate("sender", "name email profilePicture");
    for (let doc of messages) {
      doc.readBy.push(userId);
      await doc.save();
    }
    console.log(messages);
    return messages;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};
