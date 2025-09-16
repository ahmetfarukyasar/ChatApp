require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const connectedUsers = new Map();
const PORT = 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("userConnected", async (userId) => {
    console.log("User connected:", userId);
    connectedUsers.set(userId, socket.id);
    
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {isOnline: true},
        {new: true}
      );
      io.emit("userStatusChanged", {
        userId: updatedUser._id,
        isOnline: true
      });
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  });

  socket.on("userDisconnected", (userId) => {
    console.log("User disconnected with ID:", userId);  // Debug log
    connectedUsers.delete(userId);
    User.findByIdAndUpdate(userId, {isOnline: false}, {new: true})
      .then(() => {
        io.emit("userStatusChanged", {userId, isOnline: false});
      })
      .catch((err) => console.error("Error updating user status:", err));
  });

  socket.on("joinGroup", async (groupId) => {
    socket.join(groupId);
    const group = await Group.findById(groupId);
    
    if (!socket.groups) {
      socket.groups = new Set();
    }
    
    if (!socket.groups.has(groupId)) {
      socket.groups.add(groupId);
      const updatedGroup = await Group.findByIdAndUpdate(
        groupId, 
        {$inc: {activeUsers: 1}}, 
        {new: true}
      );
      io.emit("activeUsersChanged", {
        groupId, 
        activeUsers: updatedGroup.activeUsers
      });
    }
    console.log(`User joined group: ${groupId}`);
  });
   
  socket.on("leaveGroup", async (groupId) => {
      try {
          socket.leave(groupId);
          if (socket.groups && socket.groups.has(groupId)) {
              socket.groups.delete(groupId);
              const updatedGroup = await Group.findByIdAndUpdate(
                  groupId,
                  { $inc: { activeUsers: -1 } },
                  { new: true }
              );
            
              if (updatedGroup) {
                  io.emit("activeUsersChanged", {
                      groupId,
                      activeUsers: Math.max(0, updatedGroup.activeUsers)
                  });
                  console.log(`User left group: ${groupId}`);
              } else {
                  console.log(`Group not found: ${groupId}`);
              }
          }
      } catch (err) {
          console.error("Error leaving group:", err);
      }
  });

  socket.on("sendGroupMessage", async ({sender, group, text}) => {
      try {
          const newMessage = new Message({
              sender,
              group,
              text
          });
          await newMessage.save();
           
          const populatedMessage = await Message.findById(newMessage._id)
              .populate('sender', 'username')
              .populate('group', 'name');
           
          io.to(group).emit('receiveGroupMessage', populatedMessage);
      } catch (err) {
          console.error("Error sending group message: ", err);
      }
  });
  // Send Message via socket
  socket.on("sendMessage", async ({sender, receiver, text}) => {
    try {
      const newMessage = new Message({sender, receiver, text});
      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('receiver', 'username');

      const receiverSocketId = connectedUsers.get(receiver.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
        io.to(socket.id).emit('receiveMessage', populatedMessage);
      }
    } catch (err) {
      console.error("Error sending message: ", err);
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        User.findByIdAndUpdate(userId, {isOnline: false}, {new: true})
          .then(() => {
            io.emit("userStatusChanged", {userId, isOnline: false});
          })
          .catch((err) => console.error("Error updating user status:", err));
        break;
      }
    }
    console.log("User disconnected.", socket.id);
  });
});

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MognoDB connection successful."))
    .catch((err) => console.log("Error: ", err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    isOnline: {type: Boolean, required: true},
    password: {type: String, required: true}
});

// Message Schema
const MessageSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    group: {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
    text: {type: String, required: true},
    timestamp: {type: Date, default: Date.now}
});

// Group Schema
const GroupSchema = new mongoose.Schema({
  name: {type: String, required: true},
  activeUsers: {type: Number}
});

//Models
const User = mongoose.model("User", UserSchema);
const Message = mongoose.model("Message", MessageSchema);
const Group = mongoose.model("Group", GroupSchema);

// API Endpoint -> Find All Groups
app.get("/groups", async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
})

// API Endpoint -> Create Group
app.post("/groups/create", async (req, res) => {
  try {
    const {name, activeUsers} = req.body;
    
    const existingGroup = await Group.findOne({name});
    if (existingGroup) {
      return res.status(400).json({message: "This group name already taken."});
    }
    
    const group = new Group({name, activeUsers: 0});
    await group.save();

    res.json({message: "Group created successfuly."})
  } catch (err) {
    console.error("Create Group Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API Endpoint -> Send Message
app.post("/messages", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    
    const newMessage = new Message({
      sender,
      receiver,
      text
    });

    await newMessage.save();

    // Populate sender and receiver information
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('receiver', 'username');

    // Emit the message
    const receiverSocketId = connectedUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Create Message Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API Endpoint -> Send Message Group
app.post("/messages/group", async (req, res) => {
  try {
    const {sender, group, text} = req.body;
    const newMessage = new Message({
      sender,
      group,
      text
    });
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id)
    .populate('sender', 'username')
    .populate('group', 'name');
    
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Create group message error: ", err);
    res.status(500).json({message: "Internal server error"});
  }
});

// API Endpoint -> Find Messages Between Two Users
app.get("/messages/:id", async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId;
    const otherUserId = req.params.id;

    const messages = await Message.find({
      $or: [
        {sender: currentUserId, receiver: otherUserId},
        {sender: otherUserId, receiver: currentUserId}
      ]
    })
    .sort({timestamp: 1})
    .populate('sender', 'username')
    .populate('receiver', 'username');

    res.json(messages);
  } catch (err) {
    console.error("Get Messages Error: ", err);
    res.status(400).json({message: "Internal server error"});
  }
});

// API Endpoint -> Find messages group
app.get("/messages/group/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;  // Fixed parameter name
    
    const messages = await Message.find({
      group: groupId
    })
    .sort({timestamp: 1})
    .populate('sender', 'username')
    .populate('group', 'name');

    res.json(messages);
  } catch (err) {
    console.error("Get Group Messages Error: ", err);
    res.status(500).json({message: "Internal server error"});
  }
});

// API Endpoint -> Register
app.post("/register", async (req, res) => {
  try {
    const { username, password, isOnline } = req.body;
    
    // Username Check
    const existingUser = await User.findOne({username});
    if (existingUser) {
      return res.status(400).json({message: "This username already taken."});
    }

    // Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword, isOnline: false });
    await user.save();

    res.json({ message: "Register successful!" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API Endpoint -> Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Username couldn't be found!" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is not correct!" });
    }

    const token = jwt.sign(
      {username: user.username},
      process.env.SECRET_KEY,
      {expiresIn: "1h"}
    );

    const updateStatus = await User.findOneAndUpdate(
      {username},
      {isOnline: true},
      {new: true}
    );

    res.json({ 
      message: "Login Successful!", 
      token, 
      user: {
        _id: user._id,
        username: user.username,
        isOnline: true
      } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API Endpoint -> Find All Users
app.get("/users", async (req, res) => {
    try {
      const users = await User.find().select('username isOnline _id');
      console.log("Users found:", users); // Debug log
      res.json(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({error: err.message});
    }
});

// Start Server
httpServer.listen(PORT, () => {
    console.log(`Server running on ${PORT} port.`);
});