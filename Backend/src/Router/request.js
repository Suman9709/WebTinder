const express = require("express")
const mongoose = require("mongoose")
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectioRequest.js");
const User = require("../models/userSchema.js");

const requestRouter = express.Router();

//sendconnectionrequest
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"]

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status type",
                status
            })
        }
        //check user exist
        const toUser = await User.findById(toUserId)
        if (!toUser) {
            return res.status(404).json({
                message: "USer not found"
            })
        }

        //check for self from here or from schema using pre middleware
        // if (toUserId === fromUserId) {
        //     return res.status(400).json({
        //         message: "You cannot send a connection request to yourself"
        //     })
        // }

        //check existing connection request
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ],
        })

        if (existingConnectionRequest) {
            return res.status(400).send({ message: "Connection Request Already Exist" })
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        })

        const data = await connectionRequest.save()

        res.json({
            message: req.user.firstName + " is " + status + " in " + toUser.firstName,
            data,
        })

    } catch (error) {
        res.status(400).send("Error: " + error.message)
    }

})



requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        // console.log(requestId);

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Status is not allowed"
            })
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequest) {
            return res.status(404).json({
                message: "Connection request not found"
            })
        };

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.status(200).json({
            message: "connection request " + status, data
        })
        //validate the status
        //sachin -> msdhoni
        //is msdhoni is loggedin user so that he can accept the request of sachin
        // status should be in interested
        // requestId should be valid


    } catch (error) {
        res.status(400).send("Error: " + error.message)
    }
})




module.exports = requestRouter


