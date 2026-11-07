import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Service account credentials should be provided via environment variables
// or a path to a service account JSON file.
// For now, we'll assume environment variables for flexibility.

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

export default admin;
