CopyZero Frontend

Frontend application for the CopyZero Academic Integrity Platform.
Built with React 18, Vite, and Tailwind CSS.

This frontend supports both professor and student workflows and communicates with the CopyZero backend API.

Getting Started
Install dependencies
npm install

Start development server
npm run dev


App runs at:
http://localhost:5173

Build for production
npm run build

Project Structure
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── config/          # Firebase configuration
│   ├── context/         # Auth context
│   ├── pages/
│   │   ├── professor/   # Professor views
│   │   └── student/     # Student views
│   ├── services/        # API and blockchain logic
│   ├── App.jsx          # App routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json

Configuration
Firebase

Edit src/config/firebase.js and add your Firebase web credentials:

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


Get values from:
Firebase Console → Project Settings → Web App

Backend API URL

Edit src/services/api.js:

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


For production:

VITE_API_URL=https://your-backend.onrender.com

Styling

The project uses Tailwind CSS for all UI styling.

Common patterns:

<button className="px-4 py-2 bg-indigo-600 text-white rounded">
  Submit
</button>

<div className="bg-white shadow rounded p-6">
  Content
</div>

Authentication

Authentication is handled using Firebase Auth and a global React context.

Example usage:

import { useAuth } from "../context/AuthContext";

const { currentUser, userRole, logout } = useAuth();


Routes are protected using a ProtectedRoute component to enforce role-based access.

API Integration

API calls are abstracted in src/services/api.js.

Example:

const assignments = await studentAPI.getAssignments();
await studentAPI.submitAssignment(data);


The frontend never directly talks to Firebase for data—only the backend does.

Blockchain Support (Optional)

Students can optionally submit assignments using MetaMask.

Logic lives in:

src/services/blockchain.js


This feature is optional and can be disabled via environment variables.

Common Issues

Firebase auth errors

Check Firebase config values

Ensure Email/Password auth is enabled

Network errors

Ensure backend is running

Verify VITE_API_URL

Check CORS configuration in backend

Blank screen

Check browser console

Ensure correct route protection logic

Deployment
Vercel

Framework: Vite

Root directory: frontend

Build command: npm run build

Output directory: dist

Set VITE_API_URL environment variable

Netlify

Base directory: frontend

Build command: npm run build

Publish directory: frontend/dist

Summary

The CopyZero frontend provides:

Role-based dashboards

Secure authentication

Assignment submission and evaluation flows

Optional blockchain verification

Clean, responsive UI with Tailwind

It is designed to be simple to run locally and easy to deploy.

CopyZero Frontend
Part of the CopyZero Academic Integrity Platform
