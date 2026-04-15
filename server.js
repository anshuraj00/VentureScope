require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors()); // ✅ enough for CORS (no need for app.options)

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Validate env
if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set. Defaulting to mongodb://127.0.0.1:27017/venturescope");
}
if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET not set. Defaulting to insecure secret for development.");
}

// Database
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/social", require("./routes/socialRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// API 404
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// Frontend fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's room for private messaging
    socket.on('join', (userId) => {
        socket.join(userId);
        socket.userId = userId; // Store userId on socket
        console.log(`User ${userId} joined their room`);
        
        // Broadcast online status
        socket.broadcast.emit('user_online', { userId });
    });

    // Handle private messages
    socket.on('private_message', async (data) => {
        console.log('=== RECEIVED PRIVATE MESSAGE ===');
        console.log('Raw data:', JSON.stringify(data, null, 2));
        console.log('Socket userId:', socket.userId);
        try {
            const { receiverId, content, messageType = 'text' } = data;
            console.log('Parsed data - receiverId:', receiverId, 'content:', content, 'messageType:', messageType);

            // Save message to database
            const Message = require("./models/message");
            const message = new Message({
                sender: data.senderId,
                receiver: receiverId,
                content,
                messageType,
                delivered: true,
                deliveredAt: new Date()
            });
            await message.save();
            console.log('Message saved to database with ID:', message._id);

            // Populate message data
            await message.populate("sender", "name username profileImage");
            await message.populate("receiver", "name username profileImage");
            console.log('Message populated successfully');

            console.log('Sending message to receiver room:', receiverId);
            // Send to receiver's room
            io.to(receiverId).emit('receive_message', message);

            console.log('Sending confirmation to sender:', data.senderId);
            // Send confirmation to sender
            socket.emit('message_sent', message);

            console.log('=== MESSAGE PROCESSING COMPLETE ===');

        } catch (error) {
            console.error('=== SOCKET MESSAGE ERROR ===', error);
            socket.emit('message_error', { message: 'Failed to send message' });
        }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        socket.to(data.receiverId).emit('user_typing', {
            senderId: data.senderId,
            isTyping: data.isTyping
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if(socket.userId) {
            // Broadcast offline status
            socket.broadcast.emit('user_offline', { userId: socket.userId });
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});