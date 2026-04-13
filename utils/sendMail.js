const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️  EMAIL_USER or EMAIL_PASS not set. Skipping email for dev. OTP:", otp);
            return { success: true, skipped: true };
        }

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
        return { success: true };
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};

module.exports = sendOTP;