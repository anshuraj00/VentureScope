# VentureScope 🚀

VentureScope is a full-stack entrepreneurship and startup collaboration platform that enables users to share, discover, validate, and collaborate on innovative business ideas. Inspired by modern social networking platforms, VentureScope creates a community-driven ecosystem where entrepreneurs, innovators, and aspiring founders can connect and build together.

## 🌟 Features

### 👤 User Management

* User Registration and Login
* JWT-Based Authentication
* Password Hashing with bcrypt
* Email Verification using OTP
* User Profiles

### 💡 Idea Management

* Submit Startup Ideas
* Browse Community Ideas
* View Detailed Idea Information
* Categorized Idea Discovery
* Idea Approval Workflow

### 💬 Real-Time Communication

* Instant Messaging System
* Real-Time Notifications
* Socket.IO Powered Communication
* Community Collaboration Features

### 🛡️ Admin Dashboard

* Manage Users
* Review Submitted Ideas
* Approve or Reject Ideas
* Monitor Platform Activity
* Content Moderation

### 📁 File Uploads

* Image Upload Support
* Startup Idea Attachments
* Secure File Management

---

## 🏗️ Technology Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT Authentication
* bcryptjs
* Nodemailer
* Multer
* OTP Generator

### Frontend

* HTML5
* CSS3
* JavaScript

### Database

* MongoDB

---

## 📂 Project Structure

```text
VentureScope/
├── models/
├── routes/
├── controllers/
├── middleware/
├── uploads/
├── public/
├── views/
├── config/
├── server.js
├── package.json
└── README.md
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/anshuraj00/VentureScope.git
cd VentureScope
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 4. Start the Application

```bash
npm start
```

For development:

```bash
npm run dev
```

---

## 🔐 Authentication Flow

1. User registers an account.
2. OTP verification is sent via email.
3. User verifies account.
4. JWT token is generated upon login.
5. Protected routes are accessed using authenticated tokens.

---

## 📡 API Highlights

### Authentication

* POST `/api/auth/register`
* POST `/api/auth/login`
* POST `/api/auth/verify-otp`

### Ideas

* GET `/api/ideas`
* POST `/api/ideas`
* GET `/api/ideas/:id`
* PUT `/api/ideas/:id`
* DELETE `/api/ideas/:id`

### Messaging

* Real-time communication using Socket.IO

### Admin

* Manage users
* Review ideas
* Moderate content

---

## 🎯 Future Enhancements

* AI-Powered Startup Idea Suggestions
* Startup Team Formation System
* Idea Rating and Feedback
* Follow and Connect Features
* Advanced Analytics Dashboard
* Mobile Application
* Investor Discovery Platform

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Anshu Raj**

GitHub: https://github.com/anshuraj00

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub. Your support helps the project grow and reach more developers.
