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
        subject: "VentureScope Email Verification OTP",
        html: `
            <h2>Your OTP is: ${otp}</h2>
            <p>Valid for 5 minutes</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;