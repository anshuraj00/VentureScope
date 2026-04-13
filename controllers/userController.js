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

        // Hash password before storing in OTP collection (do not store plaintext password)
        const hashedPassword = await bcrypt.hash(password, 10);

        // remove old OTP
        await OTP.deleteMany({ email, purpose: 'register' });

        // save otp temporarily
        await OTP.create({
            email,
            otp,
            name,
            username,
            password: hashedPassword,
            purpose: 'register',
            expiresAt:
                new Date(Date.now() + 5 * 60 * 1000)
        });

        // send mail
        try {
            await sendOTP(email, otp);
        } catch (emailError) {
            console.error("Failed to send OTP email:", emailError.message);
            return res.status(500).json({
                message: "Failed to send OTP email. Please try again."
            });
        }

        console.log("OTP SENT ✅");

        res.status(200).json({
            message: "OTP Sent Successfully"
        });

    } catch (error) {

        console.error("Registration error:", error);

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

        // ✅ create user AFTER verification
        const newUser = new User({
            name: otpData.name,
            username: otpData.username,
            email: otpData.email,
            password: otpData.password
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


// ================= RESEND OTP =================
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existing = await OTP.findOne({ email, purpose: 'register' }).sort({ expiresAt: -1 });

        if (!existing) {
            return res.status(404).json({ message: 'No registration attempt found for this email' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        existing.otp = otp;
        existing.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await existing.save();

        try {
            await sendOTP(email, otp);
        } catch (emailError) {
            console.error("Failed to resend OTP email:", emailError.message);
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }

        return res.status(200).json({ message: 'OTP resent to email' });
    } catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({ message: 'Server Error' });
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
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "1d" }
        );

        console.log('User from DB:', user);
        console.log('User role:', user.role);

        res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role
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

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current user is following this user
        const currentUser = await User.findById(req.user.id);
        const isFollowing = currentUser.following.includes(userId);

        res.status(200).json({ user, isFollowing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const followUser = async (req, res) => {
    try {
        const userToFollowId = req.params.id;

        if (req.user.id === userToFollowId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const user = await User.findById(req.user.id);
        const userToFollow = await User.findById(userToFollowId);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.following.includes(userToFollowId)) {
            return res.status(400).json({ message: 'Already following' });
        }

        user.following.push(userToFollowId);
        userToFollow.followers.push(req.user.id);

        await user.save();
        await userToFollow.save();

        res.status(200).json({ message: 'Followed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const userToUnfollowId = req.params.id;

        const user = await User.findById(req.user.id);
        const userToUnfollow = await User.findById(userToUnfollowId);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.following = user.following.filter(id => id.toString() !== userToUnfollowId);
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);

        await user.save();
        await userToUnfollow.save();

        res.status(200).json({ message: 'Unfollowed successfully' });
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
    resendOTP,
    loginUser,
    getProfile,
    getUserProfile,
    updateProfile,
    requestEmailChange,
    confirmEmailChange,
    uploadProfileImage,
    followUser,
    unfollowUser
};