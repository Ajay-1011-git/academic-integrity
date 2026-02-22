# CopyZero - Academic Integrity Platform

A web-based platform for assignment submission and AI-powered plagiarism detection with blockchain verification support.

## Overview

CopyZero provides a dual-role system for professors and students to manage academic assignments with automated plagiarism detection and evaluation.

**Key Features:**
- Role-based access (Professor/Student)
- Assignment creation and submission management
- Three-tier plagiarism detection system
- Blockchain-based draft verification (Polygon Amoy testnet)
- AI-powered content evaluation
- Automated grading with detailed feedback

## Technology Stack

**Frontend:**
- React.js
- React Router
- Tailwind CSS
- Firebase Authentication

**Backend:**
- Node.js with Express
- Firebase Firestore (database)
- HuggingFace Inference API
- Ethers.js (blockchain integration)

**Blockchain:**
- Polygon Amoy testnet
- Smart contracts for draft verification

## Plagiarism Detection System

The platform uses a three-check evaluation system:

1. **Student-to-Student Plagiarism Detection**
   - Model: sentence-transformers/all-MiniLM-L6-v2
   - Method: Embedding similarity comparison
   - Compares submissions within the same assignment

2. **AI-Generated Text Detection**
   - Model: Hello-SimpleAI/chatgpt-detector-roberta
   - Detects AI-written content (ChatGPT, etc.)
   - Returns confidence score and verdict

3. **Content Quality Evaluation**
   - Model: HuggingFaceH4/zephyr-7b-beta
   - Evaluates against custom rubric criteria
   - Provides detailed feedback and scoring

**Final Score Calculation:**
- Plagiarism Score = MIN(student-plagiarism, AI-detection)
- Final Grade = (Plagiarism × Weight%) + (Content Quality × Weight%)

## Project Structure

```
academic-integrity/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── professor/    # Professor dashboard, assignments, evaluation
│   │   │   └── student/       # Student dashboard, submission, view scores
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API communication
│   │   └── context/           # Authentication context
│   └── public/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic (HuggingFace, blockchain)
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation
│   │   └── utils/             # Helper functions
│   └── .env                   # Environment variables (not in repo)
└── contracts/                 # Blockchain smart contracts
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Firebase project with Firestore enabled
- HuggingFace API token
- Polygon Amoy testnet wallet (for blockchain features)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
HUGGINGFACE_API_TOKEN=your_token_here
HUGGINGFACE_CONTENT_MODEL=HuggingFaceH4/zephyr-7b-beta
PRIVATE_KEY=your_blockchain_private_key
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

3. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Configure Firebase in `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  // ... other config
};
```

3. Start the development server:
```bash
npm start
```

### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy Firestore security rules from `firestore.rules`

## User Workflow

### Professor Flow

1. Login with VIT email (@vit.ac.in)
2. Create assignment with rubric criteria
3. Set plagiarism and content weightages
4. Students submit assignments
5. Auto-evaluate using AI or manually grade
6. Override scores if needed
7. View detailed analytics

### Student Flow

1. Login with VIT email (@vitstudent.ac.in)
2. View available assignments
3. Save drafts (optional blockchain verification)
4. Submit final assignment
5. View evaluation results
6. See detailed feedback and scores

## API Endpoints

**Authentication:**
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile

**Professor:**
- POST `/api/professor/assignments` - Create assignment
- POST `/api/professor/rubrics` - Create rubric
- GET `/api/professor/submissions/assignment/:id` - Get submissions
- POST `/api/professor/ollama-evaluate` - AI evaluation
- POST `/api/professor/evaluate` - Manual evaluation

**Student:**
- GET `/api/student/assignments` - Get available assignments
- POST `/api/student/submit` - Submit assignment
- POST `/api/student/drafts` - Save draft
- GET `/api/student/scores/assignment/:id` - View score

## Evaluation Models

All models run on HuggingFace's free inference API:

- **sentence-transformers/all-MiniLM-L6-v2**: 384-dimensional embeddings for similarity comparison
- **Hello-SimpleAI/chatgpt-detector-roberta**: Binary classification (Human vs AI)
- **HuggingFaceH4/zephyr-7b-beta**: Instruction-tuned LLM for content evaluation

## Blockchain Integration

Drafts can be verified on Polygon Amoy testnet:
- Each draft saves a hash on-chain
- Provides tamper-proof timestamp
- Verifiable submission history
- Requires Polygon testnet MATIC

## Security

- VIT email domain verification (@vit.ac.in, @vitstudent.ac.in)
- Role-based access control
- Firebase Authentication
- Firestore security rules
- API key environment variables
- No API keys in version control

## Known Limitations

- AI detection works best on older GPT models (GPT-3.5)
- Newer ChatGPT versions (GPT-4) may not be detected reliably
- HuggingFace free tier has rate limits
- First API call may be slow (model cold start)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or issues, please open an issue on GitHub.