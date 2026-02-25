const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ================= REGISTER =================
const registerUser = async (req, res) => {

    try {

        console.log("REGISTER API HIT ✅");

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword =
            await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        console.log("USER REGISTERED ✅");

        res.status(201).json({
            message: "Registration Successful"
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

        // Temporary success response
        res.status(200).json({
            message: "OTP Verified Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// ================= LOGIN =================
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

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

        res.status(200).json({
            message: "Login Successful"
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