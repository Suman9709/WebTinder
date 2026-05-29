require('dotenv').config();
const express = require('express')
const connectDB = require("./config/database.js")
const cookieParser = require("cookie-parser")
const cors = require('cors')
const app = express();
const http = require('http');
//this is the middleware provided by the express to read the json formate of input
app.use(express.json())
app.use(cookieParser())

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true,
// }));
app.use(cors({
    origin: process.env.CORS_ORIGIN,  // Allow frontend to access backend
    // methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    // allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));



const PORT = 3000;

const authRouter = require("./Router/auth.js")
const profileRouter = require("./Router/profile.js")
const requestRouter = require("./Router/request.js");
const userRouter = require('./Router/user.js');
const instilizeSocket = require('./utils/socket.js');

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter);

const server = http.createServer(app)
instilizeSocket(server)
connectDB()




app.get('/', (req, res) => {
    res.send('Welcome to WebTinder API');
});


// const API_PING_URL = 'https://webtinder-1.onrender.com/ping'
// const API_PING_URL = 'http://localhost:3000/ping'


// setInterval(() => {
//     fetch(API_PING_URL)
//         .then(response => console.log("Self-ping successful:", response.status))
//         .catch(error => console.error("Self-ping failed:", error));
// }, 14 * 60 * 1000)

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);

});