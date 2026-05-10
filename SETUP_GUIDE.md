# Tranontsika - Setup Guide with Email Verification

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Gmail account with app password (for email verification)

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Database

```bash
psql -U postgres
CREATE DATABASE tranontsika_db;
\q
```

### 3. Run Migrations

```bash
psql -U postgres -d tranontsika_db -f migrations/001_create_users_table.sql
psql -U postgres -d tranontsika_db -f migrations/002_add_email_verification.sql
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tranontsika_db

# JWT Secrets (use strong random strings)
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_minimum_32_characters_long

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password  # Generate from Gmail security settings

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

### 5. Generate Gmail App Password

1. Go to [Google Account Security Settings](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Create App Password for Mail → Windows Computer (or your platform)
4. Copy the generated password to `.env`

### 6. Start Backend Server

```bash
npm run dev
```

Server should run on `http://localhost:5000`

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Frontend Development Server

```bash
npm start
```

Application should open at `http://localhost:3000`

---

## 📧 Email Verification Flow

### User Signup

1. User fills signup form with email, password, and role
2. Backend sends verification email to their inbox
3. User is shown "Check your email" message
4. User clicks verification link in email
5. Email is marked as verified in database
6. User can now login

### Login

1. User enters email and password
2. Backend checks if email is verified
3. If not verified, shows error: "Please verify your email before logging in"
4. User can click "Resend Verification Email" link

### Resend Verification Email

1. User enters their email
2. Backend generates new verification token
3. New verification email is sent
4. User has 24 hours to verify

---

## 🚀 API Endpoints

### Authentication

#### POST `/api/auth/signup`

Create new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "renter" // or "owner", "broker"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "role": "renter"
  }
}
```

#### POST `/api/auth/login`

Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "role": "renter"
  }
}
```

#### POST `/api/auth/verify-email`

Verify email with token from email link

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

#### POST `/api/auth/resend-verification`

Resend verification email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

#### POST `/api/auth/refresh-token`

Refresh access token

**Request:**
```json
{
  "refreshToken": "refresh_token_from_login"
}
```

**Response:**
```json
{
  "accessToken": "new_access_token"
}
```

#### POST `/api/auth/logout` (Protected)

Logout user

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## ���� Testing Email Verification

### Using Mailtrap (Development)

For development without real email:

1. Sign up at [Mailtrap](https://mailtrap.io/)
2. Get SMTP credentials
3. Update `.env`:

```env
EMAIL_SERVICE=Mailtrap
EMAIL_USER=your_mailtrap_email
EMAIL_PASSWORD=your_mailtrap_password
```

4. Check sent emails in Mailtrap dashboard

### Using Gmail

1. Ensure 2-Step Verification is enabled
2. Create App Password (not your regular Gmail password)
3. Use the app password in `.env`

---

## 📁 Project Structure

```
tranontsika/
├── backend/
│   ├── config/
│   │   ├── database.js          # DB connection
│   │   └── email.js             # Email service
│   ├── controllers/
│   │   └── authController.js    # Auth logic
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   └── 002_add_email_verification.sql
│   ├── routes/
│   │   └── auth.js              # Auth endpoints
│   ├── server.js                # Express app
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── VerifyEmail.js
│   │   │   ├── VerifyEmailPrompt.js
│   │   │   └── Auth.css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── emailVerification.js
│   │   └── App.js
│   ├── package.json
│   └── .env.example
│
└── SETUP_GUIDE.md
```

---

## ✅ Features

✅ User registration with email verification  
✅ Secure password hashing (bcryptjs)  
✅ JWT authentication with refresh tokens  
✅ Role-based access control (Owner, Broker, Renter)  
✅ Email verification tokens (24-hour expiry)  
✅ Resend verification email functionality  
✅ Protected API endpoints  
✅ Email notifications  
✅ Password reset ready (schema in place)  

---

## 🐛 Troubleshooting

### Email not sending

- Check Gmail security settings
- Ensure app password is correct
- Check `NODE_ENV=development` in `.env`
- View logs in console for error messages

### Database connection error

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### CORS errors

- Check `FRONTEND_URL` in backend `.env`
- Ensure frontend and backend are on correct ports
- Check CORS middleware in `server.js`

### Verification token invalid

- Token expires after 24 hours
- User must click link within 24 hours
- Can resend verification email for new token

---

## 🚀 Next Steps

1. Property listing system
2. Search and filter functionality
3. Messaging system between users
4. Photo upload for properties
5. Booking and rental management
6. Dashboard for each role

---

## 📞 Support

For issues or questions, please create an issue in the repository.
