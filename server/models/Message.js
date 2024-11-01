import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const messageSchema = new Schema(
  {
    content: { type: String, required: true },
    sender: { type: _Schema.Types.ObjectId, ref: "User", required: false },
    recipient: { type: _Schema.Types.ObjectId, ref: "User", required: false },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ["text", "image", "video"], default: "text" },
    media_URL: { type: String, default: null },
    is_deleted: { type: Boolean, default: false },
    deleted_by: { type: _Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  },
);

export default model("Message", messageSchema);
