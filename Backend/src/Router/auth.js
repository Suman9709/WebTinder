const express = require("express")
const { validateSignupData } = require("../utils/validation.js")
const User = require("../models/userSchema.js")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const authRouter = express.Router();


/*
both are same
const app = express();
app.use()
//or
authRouter.use
*/

//signup
authRouter.post("/signup", async (req, res) => {
    //created new instance of the user model

    // console.log(req.body);

    // const user = new User(req.body)

    // 2nd method 
    // const user = new User({
    //     firstName: "Suman",
    //     lastName: "Kumar",
    //     emailId: "abc@gmail.com",
    //     password: "12345678",
    // });
    try {
        //validate data
        validateSignupData(req)

        // Encrypt the password
        const { firstName, lastName, emailId, password, age, gender, skills, description, imageUrl } = req.body
        const passwordHash = await bcrypt.hash(password, 10)
        // console.log("Hash password", passwordHash);


        //new instance of user
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            skills,
            description,
            imageUrl,

        })
        const savedUser = await user.save();
        //create a jwt token
        const token = await savedUser.getJWT()
        console.log("SignUp token", token);

        //add the token to cookies and send the response back to the user
        // res.cookie("token", "sdfghjktryuibvnm") //test
        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });
        res.json({
            message: "User added successfully",
            data: savedUser,
        });
    } catch (error) {
        res.status(400).send("Error in saving user" + error.message)
    }
});


//login
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password) {
            throw new Error("Please enter the email and password")
        }
        const user = await User.findOne({ emailId: emailId })

        if (!user) {
            throw new Error("EmailId is not present in databse")
        }

        const isPasswordValid = await user.validatePassword(password)

        if (isPasswordValid) {

            //create a jwt token
            const token = await user.getJWT()
            console.log("Login token", token);

            //add the token to cookies and send the response back to the user
            // res.cookie("token", "sdfghjktryuibvnm") //test
            // res.cookie("Login after wraping in to cookies token", token, {
            //     expires: new Date(Date.now() + 8 * 360000)//it will expire in 8hr
            // })

            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
                sameSite: "None",
            });

            res.send(user)
        }
        else {
            throw new Error("password is not correct")
        }

    } catch (error) {
        console.log(error);

        res.status(400).send("Something wrong while login: " + error.message);
    }
});

//logout
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.send("Logout successful");
})


// authRouter.get('/ping', (req, res) => {
//     return res.send('Server is running')
// })

module.exports = authRouter;