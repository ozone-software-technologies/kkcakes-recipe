import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
console.log('--- Debug Info ---');
console.log('Raw Key type:', typeof privateKeyRaw);
console.log('Raw Key length:', privateKeyRaw?.length);
if (privateKeyRaw) {
    console.log('Contains literal \\n:', privateKeyRaw.includes('\\n'));
    console.log('Contains actual newline:', privateKeyRaw.includes('\n'));
    console.log('First 50 chars:', privateKeyRaw.substring(0, 50));
}

const privateKeyProcessed = privateKeyRaw?.replace(/\\n/g, '\n');
console.log('Processed Key length:', privateKeyProcessed?.length);
if (privateKeyProcessed) {
    console.log('Processed Contains literal \\n:', privateKeyProcessed.includes('\\n'));
    console.log('Processed Contains actual newline:', privateKeyProcessed.includes('\n'));
}

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKeyProcessed,
        }),
    });
    console.log('SUCCESS: Admin initialized!');
} catch (e: any) {
    console.error('FAILURE:', e.message);
}
