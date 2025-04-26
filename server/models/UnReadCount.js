const mongoose = require("mongoose");
const { Schema } = mongoose;

const unreadCountSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

//  ensure one record per (chatId, userId) pair
unreadCountSchema.index({ chatId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("UnreadCount", unreadCountSchema);
