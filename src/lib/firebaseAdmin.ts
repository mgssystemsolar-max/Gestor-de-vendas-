import * as admin from 'firebase-admin';

let dbInstance: admin.firestore.Firestore | null = null;

export function db() {
  if (!dbInstance) {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    
    if (!serviceAccountBase64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is required. Please set it in the AI Studio settings.');
    }

    try {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      
      dbInstance = admin.firestore();
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_BASE64 configuration.");
    }
  }
  
  return dbInstance;
}
