const express = require("express")
const User = require("../models/userSchema.js")
const { userAuth } = require("../middlewares/auth.js");
const { validateEditProfileData } = require("../utils/validation.js");

const profileRouter = express.Router();


//get profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        // const cookies = req.cookies;
        // const { token } = cookies
        // if (!token) {
        //     throw new Error("Invalid token")
        // }
        //validate token
        // const isValidToken = await jwt.verify(token, process.env.JWT_SECRET_KEY) //this gives a decode mesaage that is id
        // const { _id } = isValidToken
        // console.log("Logged in user id is" + _id);

        // const user = await User.findById(_id)

        // console.log(isValidToken);

        // res.send(user)

        // new vwersion after middleware attach 
        const user = req.user
        res.send(user)
    } catch (error) {
        res.status(400).send("Something wrong while getting profile: " + error.message);
    }

});

//find user by email
// profileRouter.get("/profile", async (req, res) => {
//     const userEmail = req.body.emailId;

//     try {
//         const user = await User.find({ emailId: userEmail })
//         res.send(user)
//     } catch (error) {
//         res.status(400).send("something went wring")
//     }
// })

//update the user 
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    // const userId = req.body.userId;
    // const data = req.body;
    // try {
    //     await User.findByIdAndUpdate({ _id: userId }, data)
    //     res.send("User updated successfully")
    // } catch (error) {
    //     res.status(400).send("something went wring")
    // }

    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit request")
        }
        const loggedInuser = req.user;
        Object.keys(req.body).forEach((key) => loggedInuser[key] = req.body[key])


        // console.log(loggedInuser);
        await loggedInuser.save(); //this is save the data in db

        res.json({
            message: `${loggedInuser.firstName} your profile updated successfull`,
            data: loggedInuser,
        })

    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
})

//Feed API -GET/feed -get all the user from the database
// profileRouter.get("/feed", async (req, res) => {

//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (error) {
//         res.status(400).send("something went wring")

//     }
// })

//delete user form the database
profileRouter.delete("/delete", userAuth, async (req, res) => {
    const userId = req.body._id;

    try {
        // const user = await User.findByIdAndDelete({_id:userId})   // both will work
        const user = await User.findByIdAndDelete(userId)
        res.send("User deleted successfully")
    } catch (error) {
        res.status(400).send("something went wring")
    }
})






module.exports = profileRouter
