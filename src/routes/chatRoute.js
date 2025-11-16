const express = require('express');
const chatRouter=express.Router();
const Chat=require('../models/chat');
const userAuth=require('../middleware/Auth.js')

chatRouter.post('/chat/:userId',userAuth,async(req,res)=>{
    const sender = req.user._id;
    const receiver = req.params.userId;
    const {message}=req.body;
    try{
        const newMessage =  new Chat({
            sender,
            receiver,
            message,
        })
        const savedmessage= await newMessage.save();
        res.status(200).json({
            message:"Message sent successfully",
            data:savedmessage,
        })
}catch(err){
    res.status(500).json({message: err.message})

    }
})
chatRouter.get('/chat/:userId',userAuth,async(req,res)=>{
    const senderID = req.user._id;
    const receiverID = req.params.userId;
    try{
        const messages = await Chat.find({
            $or:[
                { 
                    sender:senderID,receiver:receiverID
                }
                ,{
                    receiver:senderID,sender:receiverID
                }
               
            ]
        }).sort({createdAt:1});
        res.status(200).json(messages);

    }catch(err)
    {
        res.status(500).json({ message: err.message });
    }
    
})
chatRouter.put('/chat/mark_message_read/:userId',userAuth,async(req,res)=>{
   const senderID = req.user._id;
    const receiverID = req.params.userId;
    try{
        await Chat.updateMany({
            sender:receiverID,receiver:senderID,read:false
        },{
            $set:{read:true}
        });
        res.json({success:true});

    }catch(err){
        res.status(500).json({message:"Error Making messages as read",error:err.message});
    }
})

module.exports=chatRouter;
