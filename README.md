# Crypto-to-INR Conversion Application

A full-stack MERN mobile-first web application for a crypto-to-INR conversion service.
Designed with a clean, minimal, and trustworthy dark fintech UI.

## Features

- **User Authentication**: Secure signup and login using JWT and bcrypt.
- **Deposit System**: Users can simulate depositing USDT (TRC20) using a fixed address and QR code.
- **Admin Dashboard**: Admins can approve or reject pending deposit requests.
- **Wallet System**: Automatic conversion of USDT to INR upon Admin approval (Fixed rate: 1 USDT = 83 INR).
- **Mobile-first UI**: Dark theme styling, optimized for mobile viewing with bottom navigation.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017, or a remote MongoDB URI.

### 1. Start the Backend Server

1. Open a terminal and navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. (Optional) Create a `.env` file in the `backend` folder to customize your environment:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/conversion-app
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   *The backend will run on `http://localhost:5000`.*

### 2. Start the Frontend Dev Server

1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start Vite:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173` (or similar).*

## Usage Notes

- **Admin Account**: The *very first* user account you create by signing up will automatically be assigned the `admin` role. All subsequent signups will be standard users.
- To test the full flow:
  1. Register an account (Admin).
  2. Logout and register a second account (Standard User).
  3. While logged in as the Standard User, navigate to "Deposit" and submit a deposit request.
  4. Logout and login as the Admin.
  5. In the Admin Dashboard, approve the pending request.
  6. Login as the Standard User again to see your INR balance successfully updated!
