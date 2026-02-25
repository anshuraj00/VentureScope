const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "VentureScope OTP Verification",
        html: `
            <h2>Your OTP Code</h2>
            <h3>${otp}</h3>
            <p>This OTP is valid for 5 minutes.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;