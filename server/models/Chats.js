import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const ChatSchema = new Schema(
  {
    participants: [
      { type: _Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [{ type: _Schema.Types.ObjectId, ref: "Message" }],
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    isGroup: { type: Boolean, default: false },
    lastMessage: {
      type: _Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default model("Chat", ChatSchema);
