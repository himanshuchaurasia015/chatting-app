const Chat = require("../models/Chat");

async function getUserGroups(userId) {
  const groups = await Chat.find({
    isGroup: true,
    users: userId,
  }).select("groupId");
  
  return groups.map((g) => g.groupId);
}

module.exports = getUserGroups;
