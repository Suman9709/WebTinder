const mongoose = require('mongoose')
// require('dotenv').config();

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI,{
        })
        console.log("Mongo URI:", process.env.MONGO_URI)
        // console.log("Database Connection established successfully...");
        
    } catch (error) {
        console.error("Failed to connect database", error.message)
        console.log("failed to connect db",error);
        
    }
}


module.exports=connectDB