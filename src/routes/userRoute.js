const express = require("express");
const userRouter = express.Router();
const Chat=require('../models/chat');
const userAuth = require("../middleware/Auth.js")
const user =require("../models/user.js")
const connectionRequest = require("../models/connectionRequest.js");
//get all the pending connectin requests for the logged in user
userRouter.get('/user/requests',userAuth,async(req,res)=>{
    try{
        const loggeduser = req.user;
        const loggeduserid=loggeduser._id;
        const requests = await connectionRequest.find({
            touserId:loggeduserid,
            status:"interested"
        }).populate('fromuserId',['firstName','lastName','photoUrl','about','age']);
        if(requests.length===0||!requests){
            res.status(400).send("No requests found");

        }
        res.status(200).json({message:"Requests found",data:requests});

    }catch(err){
        res.status(400).send({message:err.message})
    }
})
userRouter.get('/user/connections',userAuth,async(req,res)=>{
    try{

        const loggeduser = req.user;
        const loggeduserid=loggeduser._id;
        const connections=await connectionRequest.find({
            $or:[
                {fromuserId:loggeduserid,status:"accepted"},
                {touserId:loggeduserid,status:"accepted"}
            ]
        }).populate('fromuserId',['firstName','lastName','gender','age','photoUrl','about']).populate('touserId',['firstName','lastName','gender','age','photoUrl','about'])
        const data = await Promise.all(
      connections.map(async (row) => {
        const otherUser =
          row.fromuserId._id.toString() === loggeduserid.toString()
            ? row.touserId
            : row.fromuserId;

        // 3️⃣ Count unread messages from this user to the logged-in user
        const unreadCount = await Chat.countDocuments({
          sender: otherUser._id,
          receiver: loggeduserid,
          read: false,
        });

        // 4️⃣ Return user info + unread count
        return {
          ...otherUser.toObject(),
          unreadCount,
        };
      })
    );
            

        
        res.send({message:"Connections found",data:data});

    }catch(err){
        res.status(400).send({message:err.message})
    }
})
userRouter.get('/user/feed',userAuth,async(req,res)=>{
    try{
        const loggeduser = req.user;
        const loggeduserid=req.user._id;
        const page=parseInt(req.query.page) || 1; //pagintion
        let limit = parseInt(req.query.limit) || 10;
        limit =limit>50?50:limit;
        const skip = (page - 1) * limit;//formula to skip documents for pagination
        const connections = await connectionRequest.find({
            $or:[
                {fromuserId:loggeduserid},
                {touserId:loggeduserid}
            ]
        }).select('fromuserId touserId');
        const hideusersfromfeed = new Set();
        connections.forEach((connect)=>{
            hideusersfromfeed.add(connect.fromuserId.toString());
            hideusersfromfeed.add(connect.touserId.toString());
        })

        const feeds = await user.find({
          $and:[ {_id: { $nin: Array.from(hideusersfromfeed) }}, 
                 {_id: { $ne: loggeduserid }}
                ]
        }).select('firstName lastName photoUrl age gender skills').skip(skip).limit(limit);
        res.status(200).json({message:"Feeds found",data:feeds});

    }catch(err){
        res.status(400).send({message:err.message});
        

    }
})
userRouter.get("/user/:id", userAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // ✅ use capitalized 'User' model
    const foundUser = await user.findById(userId);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: foundUser });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports=userRouter;