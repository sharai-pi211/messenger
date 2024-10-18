const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Изменено на optional
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Изменено на optional
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  media_URL: { type: String, default: null },
  is_deleted: { type: Boolean, default: false },
  deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, {
  timestamps: true
});


module.exports = mongoose.model('Message', messageSchema);