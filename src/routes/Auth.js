const express = require('express');
const authRouter = express.Router();
const user = require('../models/user.js')
const bcrypt = require('bcrypt');
const{uservalidation}=require('../utils/validate.js');
authRouter.post('/user',async(req,res)=>{
    try{

        uservalidation(req);
        const {firstName,lastName,email,password} = req.body;
        const passwordHash = await bcrypt.hash(password,10);

        const newuser = new user({
            firstName,lastName,email,password:passwordHash
        })
        await newuser.save();
        const token = await newuser.getJWT();
        console.log(token)
        res.cookie("token",token);
        console.log(newuser);
        res.status(201).json({message:"User created successfully",user:newuser});
    }catch(err){
        res.status(500).json({message:"Check the user credentials",error:err.message});
    }
})
authRouter.post('/login',async(req,res)=>{
    const{email,password}=req.body;
    try{
        const presentuser = await user.findOne({email:email})
        if(!presentuser){
            return res.status(400).json({message:"User not found"});
        }
        const passwordcompare = await bcrypt.compare(password,presentuser.password);
        if(!passwordcompare){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token = await presentuser.getJWT();
        console.log(token)
        res.cookie("token",token);
        res.status(200).json({message:"Login successful",data:presentuser});
    }catch(err){
        res.status(500).json({message:"Internal server error",error:err.message});
    }
})
authRouter.post('/logout',async(req,res)=>{
    try{
        const {token}=req.cookies;
        if(!token){
            return res.json({message:"No token found"});
        }
        res.clearCookie('token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

        res.json({message:"Logout successful"});
    }catch(err){
        res.send("Error in logout"+err.message)
    }
})
module.exports=authRouter;