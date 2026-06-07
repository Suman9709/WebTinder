const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 20,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // index:true,  if we use unique the mongodb automatically add index   
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        enum: {
            values: ["Male", "Female", "Others"],
            message: `{VALUE} is not a valid gender type`
        },
        // validate(value) {
        //     if (!["Male", "Female", "Others"].includes(value)) {
        //         throw new Error("Gender is not valid")
        //     }
        // },
    },
    description: {
        type: String,
        default: "This is description",
    },
    skills: {
        type: String,
    },
    imageUrl: {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
        // validate(value) {
        //     if (!validator.isURL(value)) {
        //         throw new Error("Invalid Photo URL: " + value);
        //     }
        // },
    },


}, {
    timestamps: true,
});
//usermodel


//mongoose methods

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}

userSchema.methods.getJWT = async function () {
    const user = this;

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_SECRET_KEY_EXPIRY
    });
    return token;
}


const User = mongoose.model("User", userSchema)



module.exports = User;