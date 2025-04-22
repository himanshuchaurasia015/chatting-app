const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: String,
      required: function () {
        return this.isGroup;
      },
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupPicture: {
      type: String,
      default: "default-group.png",
    },
    description: {
      type: String,
    },
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    muted: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        until: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
