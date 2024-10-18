const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({ 
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
  messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
  title: {type: String, default: ''},
  description: {type: String,default: ''},
  isGroup: {type: Boolean, default: false},
  lastMessage: {type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
}, {
  timestamps: true,
});

module.exports = mongoose.model('Chat', ChatSchema);