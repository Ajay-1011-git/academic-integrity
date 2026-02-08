CopyZero Backend API

Backend service for the CopyZero academic integrity platform.
Built using Node.js, Express, and Firebase.

Getting Started
Install dependencies
npm install

Environment setup
cp .env.example .env


Edit .env:

PORT=5000
NODE_ENV=development

Firebase setup

Download a Firebase service account key from the Firebase Console

Save it as firebase-service-account.json in the backend root

Do not commit this file to version control

Running the Server
Development
npm run dev

Production
npm start


Server runs on:
http://localhost:5000

Project Structure
backend/
├── src/
│   ├── config/        # Firebase configuration
│   ├── controllers/   # Request handling logic
│   ├── middleware/    # Auth and error handling
│   ├── routes/        # API routes
│   ├── services/      # Database and utilities
│   └── utils/         # Helper functions
├── server.js          # Application entry point
├── .env               # Environment variables
├── package.json

API Overview
Authentication

POST /api/auth/signup

POST /api/auth/login

GET /api/auth/profile

Professor

Create and manage assignments

Define rubrics

View and evaluate submissions

Override scores

Student

View assignments

Submit work

Save drafts

View scores

Database

The backend uses Firestore with the following collections:

users

assignments

submissions

rubrics

scores

Each document includes ownership, timestamps, and role-based access control.

Security

Firebase Authentication with ID tokens

JWT verification middleware

Role-based authorization

Firestore security rules to restrict data access

Testing

Example login request:

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@university.edu","password":"password"}'


Postman is recommended for testing APIs.

Dependencies

Key dependencies:

express

firebase-admin

cors

dotenv

Deployment

The backend can be deployed on platforms like Render:

Build command: npm install

Start command: npm start

Configure environment variables

Add Firebase service account as a secure file

Notes

Use nodemon for faster development

Keep secrets out of the repository

Test APIs independently before connecting the frontend

CopyZero Backend API
Simple, secure, and role-based service for academic integrity.