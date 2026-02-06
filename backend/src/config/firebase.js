const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');

let firebaseApp;

try {
  const serviceAccount = require(serviceAccountPath);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });

  console.log('✅ Firebase Admin initialized successfully');
  console.log('📦 Using Firestore for file storage (no Storage bucket needed)');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.error('Make sure firebase-service-account.json is in the backend folder');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true
});

module.exports = {
  admin,
  db,
  auth
};
