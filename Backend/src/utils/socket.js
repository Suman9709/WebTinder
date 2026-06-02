const socket = require('socket.io');
const Message = require('../models/messageModel');
require('dotenv').config();
const instilizeSocket = (server) => {

    const io = socket(server, {
        cors: {
            origin:process.env.CORS_ORIGIN,
            credentials: true,
        }
    })

    io.on("connection", (socket) => {
        //handle events
        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = [userId, targetUserId].sort().join("_");
            console.log(firstName + " joining room: " + roomId);

            socket.join(roomId);
        });

        socket.on("sendMessage", async ({
            firstName,
            userId,
            targetUserId,
            text,
        }) => {
            if (!text?.trim()) return;
            try {
                const roomId = [userId, targetUserId].sort().join("_");
                const message = new Message({
                    senderId: userId,
                    receiverId: targetUserId,
                    text,
                })
                await message.save();
                io.to(roomId).emit("messageReceived", { 
                    _id: message._id,
                    firstName, 
                    senderId: userId,
                    receiverId: targetUserId,
                    text,
                    createdAt: message.createdAt,
                });
            }
            catch (error) {
                console.log("Socket Error", error.message);
            }
        });


        socket.on("disconnect", () => {

        })
    });
}

module.exports = instilizeSocket