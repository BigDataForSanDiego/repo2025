import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - using known project ID from resourcify-adminapi.json
const firebaseConfig = {
  apiKey: "AIzaSyBU0jVri8KrtW6650dTkkaIJJEHsdyRdG0", // Using maps_api_key from the JSON
  authDomain: "resourcerecognition.firebaseapp.com",
  projectId: "resourcerecognition",
  storageBucket: "resourcerecognition.appspot.com",
  messagingSenderId: "12345678901", // Default value for development
  appId: "1:12345678901:web:abcdef123456" // Default value for development
};

// Debug Firebase config
console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  projectId: firebaseConfig.projectId
});

if (!firebaseConfig.projectId) {
  console.error('Missing Firebase project ID!');
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);