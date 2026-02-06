const { auth, db } = require('../config/firebase');

async function signup(req, res) {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'fullName', 'role']
      });
    }

    const vitDomains = ['@vit.ac.in', '@vitstudent.ac.in'];
    const isVIT = vitDomains.some(domain => email.endsWith(domain));
    
    if (!isVIT) {
      return res.status(403).json({ 
        error: 'Invalid email domain',
        message: 'Only @vit.ac.in and @vitstudent.ac.in emails are allowed' 
      });
    }

    if (!['student', 'professor'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        message: 'Role must be either student or professor' 
      });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: false
    });

    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email,
        fullName,
        role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }
    
    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Signup failed',
      message: error.message 
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const vitDomains = ['@vit.ac.in', '@vitstudent.ac.in'];
    const isVIT = vitDomains.some(domain => email.endsWith(domain));
    
    if (!isVIT) {
      return res.status(403).json({ 
        error: 'Invalid email domain',
        message: 'Only VIT email addresses can log in' 
      });
    }

    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      message: 'Login successful',
      user: {
        uid: userRecord.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      user: {
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        createdAt: userData.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message 
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.uid;
    const { fullName } = req.body;

    if (!fullName) {
      return res.status(400).json({ 
        error: 'Full name is required' 
      });
    }

    await db.collection('users').doc(userId).update({
      fullName,
      updatedAt: new Date().toISOString()
    });

    await auth.updateUser(userId, {
      displayName: fullName
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      fullName
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message 
    });
  }
}

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile
};