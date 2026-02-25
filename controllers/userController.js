const User = require("../models/user");
const OTP = require("../models/otpModel");
const sendOTP = require("../utils/sendMail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= SEND OTP =================
const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // ✅ Generate OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // remove old OTP
        await OTP.deleteMany({ email });

        // save otp temporarily
        await OTP.create({
            email,
            otp,
            name,
            password,
            expiresAt:
                new Date(Date.now() + 5 * 60 * 1000)
        });

        // send mail
        await sendOTP(email, otp);

        console.log("OTP SENT ✅");

        res.status(200).json({
            message: "OTP Sent Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};



// ================= VERIFY OTP =================
const verifyOTP = async (req, res) => {

    try {

        const { email, otp } = req.body;

        const otpData =
            await OTP.findOne({ email, otp });

        if (!otpData) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (otpData.expiresAt < new Date()) {
            return res.status(400).json({
                message: "OTP Expired"
            });
        }

        // ✅ hash password now
        const salt = await bcrypt.genSalt(10);
        const hashedPassword =
            await bcrypt.hash(otpData.password, salt);

        // ✅ create user AFTER verification
        const newUser = new User({
            name: otpData.name,
            email: otpData.email,
            password: hashedPassword
        });

        await newUser.save();

        // delete otp
        await OTP.deleteMany({ email });

        console.log("USER VERIFIED ✅");

        res.status(201).json({
            message: "Email Verified & Registered"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};



// ================= LOGIN =================
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user =
            await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const isMatch =
            await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // JWT token
        const token = jwt.sign(
            { id: user._id },
            "secretkey",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login Successful",
            token
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
};



// ================= EXPORT =================
module.exports = {
    registerUser,
    verifyOTP,
    loginUser
};