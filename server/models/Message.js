import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const messageSchema = new Schema(
  {
    content: { type: [String], required: true },
    sender: { type: _Schema.Types.ObjectId, ref: "User", required: false },
    recipient: { type: _Schema.Types.ObjectId, ref: "User", required: false },
    conversation_id: { type: _Schema.Types.ObjectId, ref: "Chat", required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ["text", "image"], default: "text" },
    media_URL: { type: [String], default: [] },
    is_deleted: { type: Boolean, default: false },
    deleted_by: { type: _Schema.Types.ObjectId, ref: "User", default: null },
    reactions: [
      {
        emoji: { type: String, required: true }, // Эмодзи реакции
        userId: { type: _Schema.Types.ObjectId, ref: "User", required: true }, // ID пользователя
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default model("Message", messageSchema);
