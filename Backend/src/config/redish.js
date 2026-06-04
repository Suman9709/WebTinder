const { createClient } = require("redis");


const redishClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false,
    },
});

redishClient.on("error", (err) => {
    console.log("Redis Client Error", err);
})

const connectRedis = async () => {
    await redishClient.connect();
    console.log("Connected to Redis successfully...");
}

module.exports = {
    redishClient,
    connectRedis,
}