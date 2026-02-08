CopyZero – Academic Integrity Platform

CopyZero is an academic integrity platform designed to help educational institutions ensure authentic student work.
It combines plagiarism detection, draft tracking, and optional blockchain-based submission verification.

The system supports both professors and students, with clear role-based access and transparent evaluation.

What CopyZero Does
For Professors

Create assignments and evaluation rubrics

Review all student submissions in one place

Use AI-assisted plagiarism detection

Manually adjust scores with justification

Track student drafts as integrity evidence

For Students

Write and submit assignments securely

Auto-save drafts every few seconds

Choose between direct submission or blockchain verification

View scores and feedback after evaluation

Maintain a complete submission history

Tech Stack

Frontend: React, Vite, Tailwind CSS

Backend: Node.js, Express

Database: Firebase Firestore

Authentication: Firebase Auth

AI: Custom plagiarism detection service

Blockchain (optional): Web3.js with MetaMask

Deployment: Vercel (frontend), Render (backend)

Getting Started
Prerequisites

Node.js (v18 or newer)

npm

Firebase account

Git

Installation
1. Clone the repository
git clone https://github.com/YOUR-USERNAME/copyzero.git
cd copyzero

2. Backend setup
cd backend
npm install
cp .env.example .env


Edit .env:

PORT=5000
NODE_ENV=development


Add your Firebase service account file as:

backend/firebase-service-account.json


Do not commit this file.

3. Frontend setup
cd frontend
npm install


Add your Firebase web configuration in:

frontend/src/config/firebase.js

4. Run the project

Backend:

cd backend
npm run dev


Frontend:

cd frontend
npm run dev


Access:

Frontend: http://localhost:5173

Backend API: http://localhost:5000

Project Structure
copyzero/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── index.html
│
├── README.md
└── LICENSE

How It Works

Users authenticate using Firebase Auth

Students write submissions with automatic draft saving

Submissions are saved directly or optionally verified on blockchain

Professors evaluate using AI assistance and manual scoring

Scores and feedback are made available to students

Security Overview

Firebase-based authentication

Role-based access control

Firestore security rules

Encrypted storage of submissions

Full audit trail for evaluations

Optional immutable blockchain proof

Deployment
Backend (Render)

Build command: npm install

Start command: npm start

Add environment variables

Store Firebase credentials as secret files

Frontend (Vercel)

Framework: Vite

Root directory: frontend

Build command: npm run build

Output directory: dist

Contributing

Fork the repository

Create a feature branch

Commit your changes

Open a pull request

Follow existing patterns and keep code readable.

License

MIT License. See the LICENSE file for details.

Summary

CopyZero focuses on:

Transparent evaluation

Academic integrity

Secure submissions

Practical tooling for educators

It is designed to be easy to deploy, easy to use, and extensible for future features.