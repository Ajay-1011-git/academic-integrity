import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAWSJSA0rBfji49aNexlBBG3S0DHTOQpoY",
  authDomain: "vit-academic-integrity-9f5ec.firebaseapp.com",
  projectId: "vit-academic-integrity-9f5ec",
  storageBucket: "vit-academic-integrity-9f5ec.firebasestorage.app",
  messagingSenderId: "814567083860",
  appId: "1:814567083860:web:626c33ca00428cb39482c1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;