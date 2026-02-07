# CopyZero Frontend

React-based frontend for the CopyZero academic integrity platform. Built with React 18, Vite, and Tailwind CSS.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

App will run on: http://localhost:5173

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/              # Images, icons, static files
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── config/
│   │   └── firebase.js      # Firebase configuration
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/
│   │   ├── professor/       # Professor pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateAssignment.jsx
│   │   │   ├── ViewSubmissions.jsx
│   │   │   └── EvaluateSubmission.jsx
│   │   ├── student/         # Student pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ViewAssignments.jsx
│   │   │   ├── SubmitAssignment.jsx
│   │   │   └── ViewScores.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Home.jsx
│   ├── services/
│   │   ├── api.js           # API calls
│   │   └── blockchain.js    # Web3/MetaMask integration
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Public assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

---

## 🔧 Configuration

### Firebase Configuration

Edit `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

Get these values from:
Firebase Console → Project Settings → General → Your apps → Web app

### API Configuration

Edit `src/services/api.js` to set backend URL:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

For production, set environment variable:
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🎨 Styling

### Tailwind CSS

CopyZero uses Tailwind CSS for styling. Key classes:

**Colors:**
- Primary Blue: `bg-indigo-600` `text-indigo-600`
- Success Green: `bg-green-600` `text-green-600`
- Error Red: `bg-red-50` `text-red-800`

**Common Patterns:**
```jsx
// Button
<button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
  Click Me
</button>

// Card
<div className="bg-white rounded-lg shadow px-8 py-6">
  Content
</div>

// Input
<input 
  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
/>
```

---

## 🔐 Authentication

### AuthContext

The app uses React Context for authentication:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { currentUser, userRole, logout } = useAuth();
  
  if (!currentUser) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome {currentUser.email}</div>;
}
```

### Protected Routes

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route 
  path="/student/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 📡 API Integration

### Making API Calls

```jsx
import { studentAPI, professorAPI } from '../services/api';

// Get assignments
const response = await studentAPI.getAssignments();
const assignments = response.data.assignments;

// Submit assignment
await studentAPI.submitAssignment({
  assignmentId: '123',
  fileName: 'essay.txt',
  fileContent: 'My essay content...',
  fileType: '.txt',
  submissionType: 'direct'
});
```

### Available APIs

**Student API:**
- `getAssignments()` - Get all assignments
- `getAssignmentById(id)` - Get single assignment
- `submitAssignment(data)` - Submit assignment
- `saveDraft(data)` - Save draft
- `getLatestDraft(assignmentId)` - Get latest draft
- `getMyScores()` - Get all scores

**Professor API:**
- `createAssignment(data)` - Create assignment
- `getAssignments()` - Get all assignments
- `getSubmissions(assignmentId)` - Get submissions
- `evaluateSubmission(data)` - Evaluate submission
- `overrideScore(scoreId, data)` - Override score

---

## 🔗 Blockchain Integration

### MetaMask Connection

```jsx
import { connectWallet, submitToBlockchain } from '../services/blockchain';

// Connect wallet
const address = await connectWallet();

// Submit to blockchain
const result = await submitToBlockchain({
  assignmentId: '123',
  fileName: 'essay.txt',
  fileContent: 'content...',
  studentAddress: address
});

console.log('Transaction hash:', result.txHash);
```

### Handling Errors

```jsx
try {
  await submitToBlockchain(data);
} catch (error) {
  if (error.message.includes('MetaMask')) {
    // MetaMask not installed
  } else if (error.message.includes('rejected')) {
    // User rejected transaction
  } else if (error.message.includes('Insufficient')) {
    // Insufficient gas
  }
}
```

---

## 🎯 Key Features

### Auto-Save Drafts

Automatically saves content every 3 seconds:

```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (content && !loading) {
      saveDraft(true);
    }
  }, 3000);

  return () => clearTimeout(timer);
}, [content]);
```

### Dual Submission Buttons

```jsx
{/* Direct Submit - No blockchain */}
<button onClick={handleDirectSubmit}>
  ✅ Submit Direct (FREE)
</button>

{/* Blockchain Submit - With MetaMask */}
<button onClick={handleBlockchainSubmit}>
  🔗 Submit Blockchain
</button>
```

---

## 🐛 Debugging

### Browser Console

Press F12 to open developer tools and check:
- Console tab for errors
- Network tab for API calls
- Application tab for Firebase auth

### Common Issues

**"Firebase: Error (auth/invalid-api-key)"**
- Check `src/config/firebase.js` has correct API key
- Verify API key is enabled in Firebase Console

**"Network Error"**
- Check backend is running on http://localhost:5000
- Check CORS is enabled in backend
- Verify API_URL is correct

**"JSX syntax error"**
- File must have `.jsx` extension, not `.js`
- Check all JSX is properly closed

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",              // React library
  "react-dom": "^18.2.0",          // React DOM
  "react-router-dom": "^6.20.0",   // Routing
  "firebase": "^10.7.1",           // Firebase SDK
  "axios": "^1.6.2",               // HTTP client
  "tailwindcss": "^3.3.6"          // CSS framework
}
```

---

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://your-backend.onrender.com
     ```
5. Deploy

### Netlify Deployment

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. Add environment variables
6. Deploy

---

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#2E3192',  // CopyZero Blue
          600: '#1e1f6e',
        },
        success: {
          500: '#00A86B',  // CopyZero Green
        }
      }
    }
  }
}
```

### Add Logo

1. Add logo to `src/assets/logo.png`
2. Import in component:
```jsx
import logo from '../assets/logo.png';

<img src={logo} alt="CopyZero" className="h-8" />
```

---

## 📱 Responsive Design

All pages are mobile-responsive using Tailwind breakpoints:

```jsx
{/* Mobile: full width, Desktop: 2/3 width */}
<div className="w-full md:w-2/3">
  Content
</div>

{/* Stack on mobile, row on desktop */}
<div className="flex flex-col md:flex-row gap-4">
  <div>Left</div>
  <div>Right</div>
</div>
```

Breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up as professor
- [ ] Sign up as student
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Logout
- [ ] Protected routes redirect to login when not authenticated

**Professor Flow:**
- [ ] Create assignment
- [ ] View assignments list
- [ ] View submissions for assignment
- [ ] Evaluate submission
- [ ] Override score with justification

**Student Flow:**
- [ ] View assignments
- [ ] Submit assignment (Direct)
- [ ] Submit assignment (Blockchain with MetaMask)
- [ ] Auto-save draft works
- [ ] View scores

---

## 💡 Best Practices

### State Management
```jsx
// Use useState for local state
const [content, setContent] = useState('');

// Use useEffect for side effects
useEffect(() => {
  fetchData();
}, [dependency]);

// Use Context for global state (auth, theme)
const { currentUser } = useAuth();
```

### Error Handling
```jsx
try {
  const response = await api.call();
  // Success
} catch (error) {
  console.error('Error:', error);
  setError(error.response?.data?.error || 'Something went wrong');
}
```

### Loading States
```jsx
const [loading, setLoading] = useState(false);

async function handleSubmit() {
  setLoading(true);
  try {
    await api.call();
  } finally {
    setLoading(false);
  }
}

return (
  <button disabled={loading}>
    {loading ? 'Submitting...' : 'Submit'}
  </button>
);
```

---

## 🔍 Environment Variables

Create `.env.local` for local development:

```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_BLOCKCHAIN=true
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📚 Component Examples

### Loading Spinner
```jsx
{loading && (
  <div className="flex items-center justify-center">
    <svg className="animate-spin h-8 w-8 text-indigo-600">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    </svg>
  </div>
)}
```

### Error Alert
```jsx
{error && (
  <div className="rounded-md bg-red-50 p-4 border border-red-200">
    <p className="text-sm text-red-800">{error}</p>
  </div>
)}
```

### Success Alert
```jsx
{success && (
  <div className="rounded-md bg-green-50 p-4 border border-green-200">
    <p className="text-sm text-green-800">{success}</p>
  </div>
)}
```

---

**Part of CopyZero Platform | Team CopyZero**
