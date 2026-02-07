# CopyZero Backend API

Backend server for the CopyZero academic integrity platform. Built with Node.js, Express, and Firebase.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Add your Firebase service account
# Place firebase-service-account.json in this directory

# Start development server
npm run dev

# Start production server
npm start
```

Server will run on: http://localhost:5000

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js              # Firebase initialization
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── assignmentController.js  # Assignment operations
│   │   ├── submissionController.js  # Submission handling
│   │   ├── rubricController.js      # Rubric management
│   │   ├── scoreController.js       # Evaluation & scoring
│   │   └── draftController.js       # Draft auto-save
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification, role checks
│   │   └── errorHandler.js          # Error handling
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── professorRoutes.js      # Professor endpoints
│   │   └── studentRoutes.js        # Student endpoints
│   ├── services/
│   │   ├── databaseService.js      # Firestore operations
│   │   ├── validationService.js    # Input validation
│   │   └── calculationService.js   # Score calculations
│   └── utils/
│       └── fileHandler.js          # File validation
├── firebase-service-account.json   # Firebase credentials (DO NOT COMMIT)
├── .env                            # Environment variables (DO NOT COMMIT)
├── .env.example                    # Environment template
├── server.js                       # Entry point
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
```

### Firebase Setup

1. Download service account key from Firebase Console
2. Save as `firebase-service-account.json` in backend root
3. **DO NOT commit this file to git**

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/signup          Create new account
POST   /api/auth/login           User login
GET    /api/auth/profile         Get user profile
```

### Professor Endpoints
```
POST   /api/professor/assignments              Create assignment
GET    /api/professor/assignments              List assignments
GET    /api/professor/assignments/:id          Get assignment
PUT    /api/professor/assignments/:id          Update assignment
DELETE /api/professor/assignments/:id          Delete assignment

POST   /api/professor/rubrics                  Create rubric
GET    /api/professor/rubrics/assignment/:id   Get rubric

GET    /api/professor/submissions/:assignmentId  Get submissions
POST   /api/professor/evaluate                   Evaluate submission
PATCH  /api/professor/scores/:id/override        Override score
```

### Student Endpoints
```
GET    /api/student/assignments                View assignments
GET    /api/student/assignments/:id            Get assignment details
POST   /api/student/submit                     Submit assignment
GET    /api/student/submissions                My submissions
GET    /api/student/submissions/:id            Get submission

POST   /api/student/drafts                     Save draft
GET    /api/student/drafts                     My drafts
GET    /api/student/drafts/assignment/:id/latest  Latest draft

GET    /api/student/scores                     My scores
GET    /api/student/scores/assignment/:id      Assignment score
```

---

## 🗄️ Database Schema

### Collections

#### users
```javascript
{
  id: string,              // Firebase UID
  email: string,           // User email
  fullName: string,        // Full name
  role: string,            // 'professor' | 'student'
  institution: string,     // University/school
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### assignments
```javascript
{
  id: string,
  professorId: string,
  professorName: string,
  title: string,
  description: string,
  dueDate: timestamp,
  type: string,            // 'essay' | 'code' | 'report'
  allowedFileTypes: array, // ['.txt', '.pdf', '.docx']
  status: string,          // 'active' | 'closed'
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### submissions
```javascript
{
  id: string,
  assignmentId: string,
  studentId: string,
  studentName: string,
  studentEmail: string,
  fileName: string,
  fileType: string,
  fileContent: string,
  fileHash: string,
  fileSize: number,
  submittedAt: timestamp,
  status: string,              // 'draft' | 'final'
  version: number,
  isLocked: boolean,
  submissionType: string,      // 'direct' | 'blockchain'
  blockchainTxHash: string,    // Transaction hash (if blockchain)
  blockchainVerified: boolean, // Verification status
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### rubrics
```javascript
{
  id: string,
  assignmentId: string,
  professorId: string,
  criteria: array,         // [{name, description, maxPoints}]
  totalPoints: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### scores
```javascript
{
  id: string,
  submissionId: string,
  assignmentId: string,
  studentId: string,
  professorId: string,
  plagiarismScore: number,
  criteriaScores: object,  // {criterionId: score}
  totalScore: number,
  feedback: string,
  overridden: boolean,
  overrideReason: string,
  evaluatedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔐 Security

### Authentication Flow
1. User signs up/logs in via Firebase Auth
2. Firebase returns ID token
3. Token sent in Authorization header: `Bearer <token>`
4. Backend verifies token with Firebase Admin
5. User data extracted from token
6. Role checked for endpoint access

### Middleware
- `verifyToken` - Validates Firebase ID token
- `checkRole` - Ensures user has required role
- `checkVITEmail` - Validates institutional email (optional)

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Students can read assignments, professors can write
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'professor';
    }
  }
}
```

---

## 🧪 Testing

### Manual Testing with cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"student@university.edu","password":"password123","fullName":"John Doe","role":"student"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@university.edu","password":"password123"}'
```

**Create Assignment (requires professor token):**
```bash
curl -X POST http://localhost:5000/api/professor/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Essay 1","description":"Write an essay","dueDate":"2026-03-01","type":"essay","allowedFileTypes":[".txt",".pdf"]}'
```

---

## 🐛 Debugging

### Enable Debug Logging

Add to your code:
```javascript
console.log('📥 Request body:', req.body);
console.log('👤 User:', req.user);
console.log('📊 Query result:', data);
```

### Check Firebase Connection
```javascript
const admin = require('firebase-admin');
console.log('Firebase app:', admin.app().name); // Should print '[DEFAULT]'
```

### Common Issues

**"Firebase Admin not initialized"**
- Check `firebase-service-account.json` exists
- Verify JSON format is valid
- Ensure file path is correct in `src/config/firebase.js`

**"TypeError: argument handler must be a function"**
- Check `module.exports` is at END of controller file
- Verify all functions are exported
- Run: `node -e "console.log(require('./src/controllers/submissionController'))"`

**"Validation failed"**
- Check all required fields are present
- Verify data types match schema
- Look at `err.response.data.details` for specifics

---

## 📚 Dependencies

```json
{
  "express": "^4.18.2",           // Web framework
  "firebase-admin": "^12.0.0",    // Firebase SDK
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^16.0.3",            // Environment variables
  "crypto": "^1.0.1"              // Hash generation
}
```

---

## 🚀 Deployment

### Render Deployment

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - Add all `.env` variables
     - Add Firebase config as JSON in env var

4. Add `firebase-service-account.json` as secret file

5. Deploy

### Environment Variables for Production
```env
PORT=5000
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

---

## 📝 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

---

## 🔄 Development Workflow

1. Create feature branch
2. Make changes
3. Test with Postman/cURL
4. Check console logs
5. Commit changes
6. Push to GitHub
7. Deploy to Render

---

## 💡 Tips

- **Use nodemon** for auto-restart during development
- **Log everything** during debugging
- **Test with Postman** for easier API testing
- **Check Firebase Console** to verify data is saving
- **Use environment variables** for all sensitive data

---

**Part of CopyZero Platform | Team CopyZero**
