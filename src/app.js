const express = require('express');
const database=require('./config/database.js');
const app = express();
const http = require('http');
const cors = require('cors');
const authRouter=require('./routes/Auth.js');
const profileRouter=require('./routes/profile.js');
const connectRequestRouter=require('./routes/connectionRequest.js');
const userRouter=require('./routes/userRoute.js');
const chatRouter=require('./routes/chatRoute.js')
const cookie=require('cookie-parser');
const server = http.createServer(app);
app.use(express.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))
app.use(cookie())
app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',connectRequestRouter)
app.use('/',userRouter);
app.use('/',chatRouter)

// // Example: GET /user/:id
// app.get("/user/:id", async (req, res) => {
//   const user = await User.findById(req.params.id).select("firstName lastName");
//   if (!user) return res.status(404).send("User not found");
//   res.json(user);
// });

require('../src/socket/socket.js')(server);
const PORT = process.env.PORT || 3000;
database().then(()=>
    {console.log("Database connected");
    server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});}).catch((err)=>console.log(err));


