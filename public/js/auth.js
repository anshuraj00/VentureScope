console.log("auth.js loaded ✅");


// ================= NAME VALIDATION =================
function validateName() {

    const name = document.getElementById("name").value.trim();
    const error = document.getElementById("nameError");

    const regex = /^[A-Za-z ]{3,30}$/;

    if (!regex.test(name)) {
        error.innerText = "Only letters allowed (min 3)";
        return false;
    }

    error.innerText = "";
    return true;
}


// ================= EMAIL VALIDATION =================
function validateEmail() {

    const email = document.getElementById("email").value.trim();
    const error = document.getElementById("emailError");

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
        error.innerText = "Invalid Email";
        return false;
    }

    error.innerText = "";
    return true;
}


// ================= PASSWORD VALIDATION =================
function validatePassword() {

    const password = document.getElementById("password").value;
    const error = document.getElementById("passwordError");

    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!regex.test(password)) {
        error.innerText =
            "8+ chars, Upper, Lower, Number & Symbol required";
        return false;
    }

    error.innerText = "";
    return true;
}


// ================= REGISTER USER =================
async function registerUser() {

    if (
        !validateName() ||
        !validateEmail() ||
        !validatePassword()
    ) {
        return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const res = await fetch(
            "http://localhost:5000/api/users/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await res.json();

        if (res.ok) {

            alert("OTP Sent to Email ✅");

            // save email for OTP verification
            localStorage.setItem("verifyEmail", email);

            // Hide registration form and show OTP section
            document.querySelector('.container').style.display = 'none';
            document.getElementById('otpSection').style.display = 'block';

        } else {
            document.getElementById("emailError")
                .innerText = data.message;
        }

    } catch (err) {
        console.log(err);
        alert("Server Connection Error");
    }
}


// ================= VERIFY OTP =================
async function verifyOTP() {

    const email = localStorage.getItem("verifyEmail");
    const otp = document.getElementById("otp").value.trim();

    if (!otp) {
        alert("Enter OTP");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/users/verify-otp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    otp
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Email Verified ✅");

            localStorage.removeItem("verifyEmail");

            window.location.href = "login.html";

        } else {
            alert(data.message);
        }

    } catch (error) {
        console.log(error);
        alert("Server Error");
    }
}


// ================= RESEND OTP =================
async function resendOTP() {

    const email = localStorage.getItem("verifyEmail");

    if (!email) {
        alert("No email found. Please register again.");
        return;
    }

    try {

        const res = await fetch(
            "http://localhost:5000/api/users/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email // Only send email for resend
                })
            }
        );

        const data = await res.json();

        if (res.ok) {
            alert("OTP Resent to Email ✅");
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.log(err);
        alert("Server Connection Error");
    }
}


// ================= LOGIN =================
async function loginUser() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    // ✅ basic validation
    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {

        const res = await fetch(
            "http://localhost:5000/api/users/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await res.json();

        console.log(data); // ✅ debugging

        if (res.ok) {

            // ✅ STEP 7.2 (IMPORTANT)
            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            alert("Login Successful ✅");

            window.location.href = "dashboard.html";

        } else {
            alert(data.message || "Login Failed");
        }

    } catch (error) {

        console.error("LOGIN ERROR:", error);
        alert("Server not connected");
    }
}


// ================= LOGOUT =================
function logoutUser() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}


// ================= CHECK LOGIN =================
function checkAuth() {

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login first");

        window.location.href = "login.html";
    }
}