const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectioRequest");
const User = require("../models/userSchema");

const userRouter = express.Router();


const USER_SAFE_DATA = "firstName lastName imageUrl age gender description skills";
// receive connection
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user

    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",

    }).populate("fromUserId", ["firstName", "lastName", "emailId","imageUrl", "age", "gender", "description"]);
    // we can pass this part ["firstName", "lastName"] in string like "firstName lastName" both the work in same way

    res.json({
      message: "Data Fetched successfully",
      data: connectionRequest,
    })
  } catch (error) {
    res.status(400).send("Error: " + error.message)
  }
})

//connection request
userRouter.get("/user/connection", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName")
      .populate("toUserId", "firstName lastName")
      

    const data = connectionRequest.map((row) => {
      let user;

      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        user = row.toUserId;
      } else {
        user = row.fromUserId;
      }

      return {
         _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    });

    res.json({
      message: "Connection fetched successfully",
      data,
    });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});


//feed api

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) {
      throw new Error("Login please")
    };

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = userRouter;  