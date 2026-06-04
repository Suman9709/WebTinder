require('dotenv').config();
const express = require('express')
const connectDB = require("./config/database.js")
const cookieParser = require("cookie-parser")
const cors = require('cors')
const { createRateLimiter } = require('./middlewares/rateLimiter.js');
const { connectRedis } = require('./config/redish.js');
const app = express();

const http = require('http');
//this is the middleware provided by the express to read the json formate of input
app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin: process.env.CORS_ORIGIN,  // Allow frontend to access backend
    credentials: true,
})
);



const PORT = 3000;

const authRouter = require("./Router/auth.js")
const profileRouter = require("./Router/profile.js")
const requestRouter = require("./Router/request.js");
const userRouter = require('./Router/user.js');
const chatRouter = require('./Router/chat.js');
const instilizeSocket = require('./utils/socket.js');



const server = http.createServer(app)
instilizeSocket(server)
Promise.all([connectDB(), connectRedis()])
    .then(() => {
        console.log("Database Connection established successfully...");
        console.log("Connected to Redis successfully...");
        app.use(createRateLimiter()); // Apply rate limiter to all routes (100 requests per 15 minutes)


        app.use("/", authRouter)
        app.use("/", profileRouter)
        app.use("/", requestRouter)
        app.use("/", userRouter);
        // implemented new feature of chat saving
        app.use("/", chatRouter)

        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);

        });
    }).catch((error) => {
        console.error("Application startup failed:", error);
    })



app.get('/', (req, res) => {
    res.send('Welcome to WebTinder API');
});


