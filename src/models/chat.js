const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    read:{
        type:Boolean,
        default:false
    }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
