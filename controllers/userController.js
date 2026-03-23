const User = require("../models/user");
const OTP = require("../models/otpModel");
const sendOTP = require("../utils/sendMail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= SEND OTP =================
const registerUser = async (req, res) => {

    try {

        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email already in use"
            });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                message: "Username already in use"
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
            username,
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
            username: otpData.username,
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
            "secret123",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
};



// ================= PROFILE =================
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const requestEmailChange = async (req, res) => {
    try {
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({ message: 'New email is required' });
        }

        const existing = await User.findOne({ email: newEmail });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.deleteMany({ email: newEmail, purpose: 'change-email' });

        await OTP.create({
            email: newEmail,
            otp,
            userId: req.user.id,
            purpose: 'change-email',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        await sendOTP(newEmail, otp);

        res.status(200).json({ message: 'OTP sent to new email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const confirmEmailChange = async (req, res) => {
    try {
        const { newEmail, otp } = req.body;

        if (!newEmail || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const otpDoc = await OTP.findOne({ email: newEmail, otp, purpose: 'change-email' });

        if (!otpDoc) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (otpDoc.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (otpDoc.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this operation' });
        }

        const existing = await User.findOne({ email: newEmail });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.email = newEmail;
        await user.save();

        await OTP.deleteMany({ email: newEmail, purpose: 'change-email' });

        res.status(200).json({ message: 'Email updated successfully', email: newEmail });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save the image URL in user profile
        const imagePath = `http://127.0.0.1:5000/uploads/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(req.user.id, { profileImage: imagePath }, { new: true, runValidators: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Image uploaded successfully', profileImage: imagePath, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            bio: req.body.bio,
            phone: req.body.phone,
            company: req.body.company,
            skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills ? req.body.skills.split(',').map(s => s.trim()) : []),
            location: req.body.location,
            gender: req.body.gender || 'other',
            profileImage: req.body.profileImage,
            socialLinks: {
                twitter: req.body.twitter || '',
                linkedin: req.body.linkedin || '',
                github: req.body.github || ''
            }
        };

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// ================= EXPORT =================
module.exports = {
    registerUser,
    verifyOTP,
    loginUser,
    getProfile,
    updateProfile,
    requestEmailChange,
    confirmEmailChange,
    uploadProfileImage
};