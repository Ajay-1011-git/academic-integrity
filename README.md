# 🎓 CopyZero - Academic Integrity Platform

![CopyZero](https://img.shields.io/badge/CopyZero-Academic%20Integrity-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-orange?style=for-the-badge)

**CopyZero** is an AI-powered academic integrity platform that combines plagiarism detection with blockchain-verified submissions. Built for educational institutions to ensure authentic student work.

---

## 🚀 Features

### 👨‍🏫 For Professors
- ✅ Create custom assignments with evaluation rubrics
- ✅ Define plagiarism vs criteria weightage
- ✅ View all student submissions in one centralized dashboard
- ✅ AI-assisted plagiarism detection
- ✅ Manual score override with justification tracking
- ✅ Track student drafts for integrity evidence
- ✅ Export evaluation reports

### 👨‍🎓 For Students
- ✅ Submit assignments via **Direct Submit** (fast & free) or **Blockchain Submit** (verified)
- ✅ Auto-save drafts every 3 seconds
- ✅ View real-time evaluation scores
- ✅ Blockchain proof of submission (optional)
- ✅ Track submission history
- ✅ Never lose your work with auto-save

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth |
| **AI Detection** | Custom AI Model Integration |
| **Blockchain** | Web3.js + MetaMask Integration |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 📦 Quick Start

### Prerequisites
- Node.js v18+ or v20+
- npm or yarn
- Firebase account
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/copyzero.git
cd copyzero
```

**2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:
```env
PORT=5000
NODE_ENV=development
```

Add your Firebase service account JSON as `backend/firebase-service-account.json`

**3. Frontend Setup**
```bash
cd frontend
npm install
```

Edit `src/config/firebase.js` with your Firebase web config.

**4. Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**5. Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🔧 Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Create new project: "CopyZero"

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password

3. **Enable Firestore**
   - Go to Firestore Database
   - Create database in production mode
   - Set location (choose nearest to you)

4. **Get Service Account**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `backend/firebase-service-account.json`

5. **Get Web Config**
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy config and paste into `frontend/src/config/firebase.js`

---

## 📖 Usage Guide

### Professor Workflow

1. **Sign Up** with institutional email (@university.edu)
2. **Create Assignment**
   - Title, description, due date
   - Assignment type (essay, code, report)
   - Allowed file types
3. **Define Rubric**
   - Add evaluation criteria
   - Assign weights (must total 100%)
4. **View Submissions**
   - See all student submissions
   - View submission type (Direct or Blockchain)
5. **Evaluate**
   - AI plagiarism score + manual criteria scoring
   - Override final score if needed with justification

### Student Workflow

1. **Sign Up** with student email
2. **View Assignments** on dashboard
3. **Write Submission**
   - Auto-saves every 3 seconds
   - Content preserved even if browser crashes
4. **Choose Submission Method:**
   - **✅ Direct Submit** - Fast, free, instant (Recommended)
   - **🔗 Blockchain Submit** - Verified, timestamped proof (Requires MetaMask)
5. **View Score** after professor evaluates

---

## 🏗️ Project Structure

```
copyzero/
├── backend/
│   ├── src/
│   │   ├── config/          # Firebase, database config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Database, calculations
│   │   └── utils/           # File handlers, helpers
│   ├── firebase-service-account.json  # Firebase credentials
│   ├── .env                 # Environment variables
│   └── server.js            # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── config/          # Firebase config
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Route pages
│   │   │   ├── professor/   # Professor pages
│   │   │   └── student/     # Student pages
│   │   ├── services/        # API calls, blockchain
│   │   └── App.jsx          # Main app component
│   ├── index.html
│   └── package.json
│
├── README.md                # This file
├── LICENSE                  # MIT License
└── .gitignore
```

---

## 📡 API Documentation

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Professor Endpoints
- `POST /api/professor/assignments` - Create assignment
- `GET /api/professor/assignments` - List all assignments
- `GET /api/professor/assignments/:id` - Get single assignment
- `POST /api/professor/rubrics` - Create evaluation rubric
- `GET /api/professor/submissions/:assignmentId` - Get all submissions for assignment
- `POST /api/professor/evaluate` - Evaluate submission
- `PATCH /api/professor/scores/:id/override` - Override score

### Student Endpoints
- `GET /api/student/assignments` - View available assignments
- `GET /api/student/assignments/:id` - Get assignment details
- `POST /api/student/submit` - Submit assignment (direct or blockchain)
- `POST /api/student/drafts` - Save draft
- `GET /api/student/drafts/assignment/:id/latest` - Get latest draft
- `GET /api/student/scores` - View all scores
- `GET /api/student/scores/assignment/:id` - Get score for assignment

Full API documentation: [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

---

## 🔒 Security Features

- ✅ **Role-based Access Control** - Professors and students have separate permissions
- ✅ **Firebase Authentication** - Industry-standard auth with token verification
- ✅ **Email Domain Validation** - Only institutional emails allowed
- ✅ **Firestore Security Rules** - Database-level access control
- ✅ **Encrypted File Storage** - Secure content storage
- ✅ **Audit Logging** - All changes tracked with timestamps
- ✅ **Optional Blockchain Verification** - Immutable proof of submission

---

## 🎯 Key Features Explained

### Dual Submission System

**Direct Submit (Recommended for Demo)**
- ✅ Instant submission
- ✅ No MetaMask required
- ✅ No blockchain fees
- ✅ Perfect for hackathon demonstrations
- ✅ Still saved to database with timestamp

**Blockchain Submit**
- 🔗 Creates blockchain transaction
- 🔗 Stores submission hash on-chain
- 🔗 Provides immutable proof
- 🔗 Requires MetaMask wallet
- 🔗 Requires gas fees
- 🔗 Shows verification status

### AI Plagiarism Detection

- Analyzes text similarity
- Checks against known sources
- Provides confidence score
- Highlights suspicious sections
- Generates detailed report

### Auto-Save Drafts

- Saves every 3 seconds automatically
- Prevents work loss from crashes
- Accessible from any device
- Shows "Auto-saving..." indicator
- Manual save option available

---

## 🚢 Deployment

### Backend Deployment (Render)

1. Create account on [Render](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:** Add your Firebase credentials
5. Deploy

### Frontend Deployment (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import Git Repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy

---

## 🧪 Testing

### Manual Testing

**Test Direct Submission:**
1. Login as student
2. Click on assignment
3. Enter filename (e.g., `test.txt`)
4. Write content
5. Click "Submit Direct (FREE)"
6. Verify submission appears in professor dashboard

**Test Blockchain Submission:**
1. Install MetaMask browser extension
2. Create/import wallet
3. Login as student
4. Click on assignment
5. Enter filename and content
6. Click "Submit Blockchain"
7. Approve transaction in MetaMask
8. Verify transaction hash stored

### Backend Testing
```bash
cd backend
npm run dev
```

Check server logs for:
- ✅ Firebase initialization
- ✅ Database connection
- ✅ Routes registered
- ✅ No errors

### Frontend Testing
```bash
cd frontend
npm run dev
```

Check for:
- ✅ Successful compilation
- ✅ No JSX errors
- ✅ Application loads
- ✅ No console errors

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style
- Use ES6+ JavaScript features
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names
- Write clean, readable code

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team CopyZero

**Built with ❤️ by the CopyZero Team**

Academic Integrity Solutions for Modern Education

---

## 📞 Support

For issues, questions, or feature requests:
- 🐛 Create an issue on [GitHub](https://github.com/YOUR-USERNAME/copyzero/issues)
- 📧 Email: support@copyzero.dev
- 💬 Discord: [Join our community](https://discord.gg/copyzero)

---

## 🗺️ Roadmap

### Version 1.0.0 (Current) ✅
- [x] Core submission system
- [x] Dual submission modes (Direct + Blockchain)
- [x] AI plagiarism detection
- [x] Auto-save drafts
- [x] Professor evaluation dashboard
- [x] Student score viewing

### Version 1.1.0 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Batch evaluation
- [ ] Export reports as PDF
- [ ] Multi-language support
- [ ] Integration with Learning Management Systems (LMS)

### Version 2.0.0 (Future)
- [ ] Video submission support
- [ ] Peer review system
- [ ] Advanced AI detection models
- [ ] Multiple blockchain network support
- [ ] Real-time collaboration
- [ ] Institutional analytics

---

## ⚡ Quick Commands

```bash
# Install all dependencies
npm run install-all

# Start both servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🎓 How CopyZero Works

### Submission Flow

```
Student Writes → Auto-Save Draft → Choose Submission Method
                                    ↓                    ↓
                           Direct Submit      Blockchain Submit
                                    ↓                    ↓
                           Save to Database   MetaMask → Blockchain
                                    ↓                    ↓
                                    └────────┬───────────┘
                                             ↓
                                    Professor Reviews
                                             ↓
                                    AI + Manual Scoring
                                             ↓
                                    Student Sees Score
```

### Security Flow

```
User Login → Firebase Auth → Token Generation → API Calls (with token)
                                                      ↓
                                            Token Verification
                                                      ↓
                                            Role Check (Professor/Student)
                                                      ↓
                                            Firestore Access (with rules)
                                                      ↓
                                            Audit Log Entry
```

---

## 🌟 Why CopyZero?

### For Educational Institutions
- 📊 **Data-Driven Insights** - Track academic integrity trends
- 🔒 **Secure & Compliant** - Industry-standard security practices
- 💰 **Cost-Effective** - Open-source core, optional premium features
- 🎯 **Easy Integration** - Works with existing systems

### For Professors
- ⏱️ **Save Time** - AI-assisted grading
- 📈 **Better Insights** - Detailed analytics
- 🎓 **Fair Evaluation** - Consistent criteria application
- 📝 **Documentation** - Audit trail for all decisions

### For Students
- ✅ **Transparency** - Know evaluation criteria upfront
- 🔐 **Proof of Work** - Blockchain verification available
- 💾 **Never Lose Work** - Auto-save protection
- 📊 **Track Progress** - See scores and feedback

---

## 🔥 Getting Started in 5 Minutes

**Quickest way to see CopyZero in action:**

```bash
# 1. Clone
git clone https://github.com/YOUR-USERNAME/copyzero.git
cd copyzero

# 2. Setup backend
cd backend && npm install && cd ..

# 3. Setup frontend  
cd frontend && npm install && cd ..

# 4. Start both (in separate terminals)
cd backend && npm run dev
cd frontend && npm run dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

**First time setup:**
1. Create Firebase project (5 min)
2. Add credentials to config files (2 min)
3. Sign up as professor & student (1 min)
4. Create and submit an assignment (2 min)

**Total setup time: ~10 minutes** ⚡

---

## 💡 Pro Tips

### For Demo Day
1. **Use Direct Submit** - No blockchain fees, instant results
2. **Pre-create assignments** - Have samples ready
3. **Test both roles** - Show professor and student views
4. **Highlight auto-save** - Refresh page to show draft recovery
5. **Show blockchain option** - Demonstrate MetaMask integration

### For Development
1. **Use environment variables** - Never commit credentials
2. **Enable debug logging** - Check `console.log` statements
3. **Test error cases** - Try invalid inputs
4. **Clear browser cache** - If issues arise
5. **Check Firebase console** - Verify data is saving

---

## 🎨 Branding

**CopyZero** - Where academic integrity meets innovation

**Tagline:** "Zero Plagiarism, Maximum Trust"

**Colors:**
- Primary: `#2E3192` (Deep Blue)
- Secondary: `#00A86B` (Green)
- Accent: `#FF6B6B` (Coral)

**Logo:** (Add your logo here)

---

## 📚 Additional Resources

- [Installation Guide](./docs/INSTALLATION.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [FAQ](./docs/FAQ.md)

---

**Made with ❤️ by Team CopyZero | Academic Integrity for the Digital Age**

*Last Updated: February 2026*
