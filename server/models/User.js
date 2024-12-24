import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    authToken: { type: Object, default: null },
    avatarUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline",
    },
    lastActive: { type: Date, default: Date.now },
    messages: [{ type: _Schema.Types.ObjectId, ref: "Message" }],
    friends: [
      {
        friendId: { type: _Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "accepted", "rejected"] },
      },
    ],
    friendRequests: [
      { type: _Schema.Types.ObjectId, ref: "User" },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default model("User", UserSchema);
